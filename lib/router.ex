defmodule Router do
  use Plug.Router

  import Links
  import Links.Validator

  @client_dir Application.get_env(:shorty, :client_dir)

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
    case get_link(id) do
      {:ok, link} ->
        %{shadow_mail: shadow, url: url, confirmed: confirmed} = link
      message = ~s/{"id":"#{id}","shadow":"#{shadow}","url":"#{url}","confirmed":"#{confirmed}"}/
      send_resp(conn, 200, message)
      {:error, err} -> send_resp(conn, 404, err)
    end
  end

  get "/:id" do
    case get_link(id) do
      {:ok, %{url: url, confirmed: true}} -> redirect(conn, url)
      _ -> redirect(conn, "/#404?" <> id)
    end
  end

  post "/create" do
    url = conn.body_params["url"] || ""
    mail = conn.body_params["mail"]

    with {:ok, valid} <- build_link(url, mail),
         {:ok, link} <- create(valid) do
      %{id: id, confirm_token: token} = link
      message = ~s/{"id":"#{id}","mail":"#{mail}","token":"#{token}","url":"#{url}"}/
      send_resp(conn, 200, message)
    else
      {:error, err} -> send_resp(conn, 400, err)
    end
  end

  defp redirect(conn, to) do
    conn
    |> resp(301, "")
    |> put_resp_header("location", to || "/")
  end
end
