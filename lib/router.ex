defmodule Router do
  use Plug.Router

  import Application, only: [get_env: 2]

  @client_dir get_env(:shorty, :client_dir)

  plug(Plug.Static,
    at: "/static",
    gzip: true,
    from: @client_dir
  )

  plug(Plug.Parsers,
    parsers: [:json],
    pass: ["application/json", "text/json"],
    json_decoder: Jason
  )

  plug(:match)
  plug(:dispatch)

  get "/" do
    conn = put_resp_content_type(conn, "text/html")
    send_file(conn, 200, @client_dir <> "/index.html")
  end

  get "/get/:id" do
    case links().get_link(id, false) do
      {:ok, link} ->
        %{shadow_mail: shadow, url: url, confirmed: confirmed} = link
        json = ~s/{"id":"#{id}","shadow":"#{shadow}","url":"#{url}","confirmed":#{confirmed}}/
        send_resp(conn, 200, json)

      {:error, err} ->
        send_resp(conn, 404, err)
    end
  end

  get "/:id" do
    case links().get_link(id) do
      {:ok, %{url: url}} -> redirect(conn, url)
      _ -> redirect(conn, "/#search?" <> id)
    end
  end

  post "/create" do
    url = conn.body_params["url"] || ""
    mail = conn.body_params["mail"]

    with {:ok, valid} <- validator().build_link(url, mail),
         {:ok, link} <- links().create(valid) do
      send_resp(conn, 200, link_json(link))
    else
      {:error, err} -> send_resp(conn, 400, err)
    end
  end

  post "/request" do
    old_id = conn.body_params["old"] || ""
    new_id = conn.body_params["id"] || ""
    mail = conn.body_params["mail"] || ""

    with {:ok, ch_req, link} <-
           links().request_change(old_id, new_id, mail),
         {:ok, _} <- confirm_mailer().send(new_id, ch_req.id, link.url, mail) do
      message =
        ~s/{"message":"Check your mail (also spam). Verification code expires in one hour."}/

      send_resp(conn, 200, message)
    else
      {:error, err} ->
        links().cancel_change(new_id)
        send_resp(conn, 400, err)
    end
  end

  post "/confirm" do
    token = conn.body_params["token"] || ""

    case links().confirm_request(token) do
      {:error, err} -> send_resp(conn, 400, err)
      {:ok, link} -> send_resp(conn, 200, link_json(link))
    end
  end

  post "/change" do
    old_id = conn.body_params["old"] || ""
    new_id = conn.body_params["id"] || ""
    token = conn.body_params["token"] || ""

    case links().instant_change(old_id, new_id, token) do
      {:error, err} -> send_resp(conn, 400, err)
      {:ok, link} -> send_resp(conn, 200, link_json(link))
    end
  end

  defp link_json(link) do
    %{id: id, confirm_token: token, owner_mail: mail, url: url} = link
    ~s/{"id":"#{id}","mail":"#{mail}","token":"#{token}","url":"#{url}"}/
  end

  defp redirect(conn, to) do
    conn
    |> resp(301, "")
    |> put_resp_header("location", to || "/")
  end

  defp links, do: get_env(:shorty, :links_mod)
  defp validator, do: get_env(:shorty, :validator_mod)
  defp confirm_mailer, do: get_env(:shorty, :mailer_mod)
end
