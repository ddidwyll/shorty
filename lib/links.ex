defmodule Links do
  import Links.Repo

  alias Links.Link
  alias Links.ChangeRequest, as: ChReq
  alias Ecto.ConstraintError, as: DBErr

  def create(item, auto_id \\ true) do
    try do
      insert(item)
    rescue
      e in DBErr ->
        if e.type == :unique do
          if auto_id, do: create(item), else: {:error, :taken}
        else
          {:error, "{\"error\": \"#{e.message}\"}"}
        end
    end
  end

  def get_link(id, confirmed_only \\ true) do
    case get(Link, id) do
      nil ->
        {:error, "{\"id\": \"Link /#{id} not found, maybe it already changed\"}"}

      link ->
        if !confirmed_only || link.confirmed,
          do: {:ok, link},
          else: {:error, "{\"id\": \"Link /#{id} not confirmed yet\"}"}
    end
  end

  defp get_req(token) do
    case get(ChReq, token) do
      nil -> {:error, "{\"token\": \"Token is expired, maybe link already changed\"}"}
      ch_req -> {:ok, ch_req}
    end
  end

  defp clone_link(link, new_id) do
    new_link = %{link | id: new_id, confirmed: false, confirm_token: nil}

    case get_link(new_id, false) do
      {:ok, _} -> {:error, "{\"id\": \"Url /#{new_id} taken, choose another\"}"}
      {:error, _} -> create(new_link, false)
    end
  end

  defp swap_links(old_id, new_id) do
    import Ecto.Changeset, only: [change: 2]

    fn ->
      %Link{id: old_id}
      |> delete!()

      %Link{id: new_id}
      |> change(confirmed: true)
      |> update!(returning: true)
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

      {:error, "{\"#{type_str}\": \"Sorry, #{type_str} #{guess} is invalid\"}"}
    end
  end

  def instant_change(old_id, new_id, token) do
    with {:ok, link} <- get_link(old_id),
         :ok <- confirmation(link, token, :confirm_token),
         {:ok, _} <- clone_link(link, new_id),
         {:ok, new_link} <- swap_links(old_id, new_id) do
      {:ok, new_link}
    end
  end

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

  def confirm_request(token) do
    with {:ok, req} <- get_req(token),
         %{new_id: new, old_id: old} <- req,
         {:ok, new_link} <- swap_links(old, new) do
      {:ok, new_link}
    end
  end

  def expire_request do
    import Enum, only: [each: 2]
    import Ecto.Query, only: [from: 2]
    import NaiveDateTime, only: [utc_now: 0, add: 3]

    hour_ago =
      utc_now()
      |> add(-3600, :second)

    query =
      from(l in ChReq,
        where: l.created < ^hour_ago,
        select: l.new_id
      )

    all(query)
    |> each(&(%Link{id: &1} |> delete))
  end
end
