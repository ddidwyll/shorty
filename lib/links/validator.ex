alias Links.Link

defmodule Links.ValidatorBehaviour do
  @callback build_link(binary, binary | nil) :: {:ok, Link.t()} | {:error, binary}
end

defmodule Links.Validator do
  @behaviour Links.ValidatorBehaviour

  defp validate_url(url) when not is_binary(url) or url == "",
    do: {:error, ~s/{"url":"Url is required"}/}

  defp validate_url(url) do
    import URI, only: [parse: 1]
    import String, only: [trim: 1]

    %{
      host: host,
      scheme: scheme
    } = parse(url)

    if is_binary(host) && is_binary(scheme) do
      {:ok, trim(url)}
    else
      {:error, ~s/{"url":"#{url} is not valid url"}/}
    end
  end

  defp shadow_mail({name, a, t}),
    do: "#{shadow(name)}@#{shadow(a)}.#{t}"

  defp shadow(str) do
    import String, only: [first: 1, last: 1, duplicate: 2]

    case String.length(str) do
      1 -> "*"
      2 -> "**"
      3 -> first(str) <> "**"
      l -> first(str) <> duplicate("*", l - 2) <> last(str)
    end
  end

  defp prepare_mail(mail) when not is_binary(mail) or mail == "",
    do: {:ok, nil, nil}

  defp prepare_mail(mail) do
    import String, only: [split: 3, reverse: 1, trim: 1]

    mail = trim(mail)

    with [name, at] <- split(mail, "@", trim: true),
         [t, a] <- split(reverse(at), ".", parts: 2),
         false <- name == "",
         false <- t == "",
         false <- a == "" do
      {
        :ok,
        mail,
        shadow_mail({name, reverse(a), reverse(t)})
      }
    else
      _ -> {:error, ~s/{"mail":"#{mail} is not valid email"}/}
    end
  end

  @impl true
  def build_link(url, owner) do
    with {:ok, url} <- validate_url(url),
         {:ok, owner_mail, shadow_mail} <- prepare_mail(owner) do
      {:ok,
       %Link{
         url: url,
         owner_mail: owner_mail,
         shadow_mail: shadow_mail,
         confirmed: true
       }}
    end
  end
end
