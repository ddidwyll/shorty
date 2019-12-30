alias Links.Link
alias Links.ChangeRequest, as: ChReq
alias Ecto.ConstraintError, as: DBErr

defmodule LinksBehaviour do
  @type item :: Link.t() | ChReq.t()
  @callback create(item) :: {:ok, item} | {:error, binary}
  @callback create(item, boolean) :: {:ok, item} | {:error, binary}
  @callback get_link(binary) :: {:ok, Link.t()} | {:error, binary}
  @callback get_link(binary, boolean) :: {:ok, Link.t()} | {:error, binary}
  @callback instant_change(binary, binary, binary) :: {:ok, Link.t()} | {:error, binary}
  @callback request_change(binary, binary, binary) ::
              {:ok, ChReq.t(), Link.t()} | {:error, binary}
  @callback confirm_request(binary) :: {:ok, Link.t()} | {:error, binary}
  @callback cancel_change(binary) :: :ok
  @callback expire_requests() :: :ok
end

defmodule Links do
  @behaviour LinksBehaviour

  import Links.Repo

  @impl true
  def create(item, auto_id \\ true) do
    try do
      insert(item)
    rescue
      e in DBErr ->
        if e.type == :unique do
          if auto_id, do: create(item), else: {:error, ~s|{"message":"Id taken"}|}
        else
          {:error, ~s|{"message":"#{e.message}"}|}
        end
    end
  end

  @impl true
  def get_link(id, confirmed_only \\ true) do
    case get(Link, id) do
      nil ->
        {:error, ~s|{"id":"Link /#{id} not found, maybe it already changed"}|}

      link ->
        if !confirmed_only || link.confirmed,
          do: {:ok, link},
          else: {:error, ~s|{"id":"Link /#{id} not confirmed yet"}|}
    end
  end

  defp get_req(token) do
    case get(ChReq, token) do
      nil -> {:error, ~s|{"token":"Token is expired, maybe link already changed"}|}
      ch_req -> {:ok, ch_req}
    end
  end

  defp clone_link(link, new_id) do
    new_link = %{link | id: new_id, confirmed: false, confirm_token: nil}

    case get_link(new_id, false) do
      {:ok, _} -> {:error, ~s|{"id":"Url /#{new_id} taken, choose another"}|}
      {:error, _} -> create(new_link, false)
    end
  end

  defp swap_links(old_id, new_id) do
    import Ecto.Changeset, only: [change: 2]

    fn ->
      try do
        %Link{id: old_id}
        |> delete!()

        %Link{id: new_id}
        |> change(confirmed: true)
        |> update!(returning: true)
      rescue
        _ ->
          cancel_change(new_id)
          rollback(~s/{"message":"Something went wrong"}/)
      end
    end
    |> transaction()
  end

  defp confirmation(link, guess, type) do
    import String, only: [split: 2]
    import Map, only: [fetch!: 2]

    value = fetch!(link, type)

    if value && value == guess do
      :ok
    else
      [_, type_str] =
        to_string(type)
        |> split("_")

      {:error, ~s|{"#{type_str}":"Sorry, #{type_str} #{guess} is invalid"}|}
    end
  end

  @impl true
  def instant_change(old_id, new_id, token) do
    with {:ok, link} <- get_link(old_id),
         :ok <- confirmation(link, token, :confirm_token),
         {:ok, _} <- clone_link(link, new_id),
         {:ok, new_link} <- swap_links(old_id, new_id) do
      {:ok, new_link}
    end
  end

  @impl true
  def request_change(old_id, new_id, mail) do
    with {:ok, link} <- get_link(old_id),
         :ok <- confirmation(link, mail, :owner_mail),
         {:ok, _} <- clone_link(link, new_id),
         {:ok, ch_req} <-
           %ChReq{
             new_id: new_id,
             old_id: old_id
           }
           |> create() do
      {:ok, ch_req, link}
    end
  end

  @impl true
  def confirm_request(token) do
    with {:ok, req} <- get_req(token),
         %{new_id: new, old_id: old} <- req,
         {:ok, new_link} <- swap_links(old, new) do
      {:ok, new_link}
    end
  end

  @impl true
  def cancel_change(new_id) do
    delete(%Link{id: new_id})
    :ok
  end

  @impl true
  def expire_requests do
    import Enum, only: [each: 2]
    import Ecto.Query, only: [from: 2]
    import Application, only: [get_env: 3]
    import NaiveDateTime, only: [utc_now: 0, add: 3]

    seconds = get_env(:shorty, :request_expires_sec, 3600)

    far_away =
      utc_now()
      |> add(-seconds, :second)

    query =
      from(l in ChReq,
        where: l.created <= ^far_away,
        select: l.new_id
      )

    all(query)
    |> each(&(%Link{id: &1} |> delete))
  end
end
