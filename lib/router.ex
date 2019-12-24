defmodule Router do
  use Plug.Router

  import Links

  @client_dir Application.get_env(:shorty, :client_dir)

  plug(Plug.Static, at: "/static", from: @client_dir)

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

  get "/:id" do
    case get_link(id) do
      {:ok, %{url: url, confirmed: true}} -> redirect(conn, url)
      _ -> redirect(conn, "/#404?" <> id)
    end
  end

  defp redirect(conn, to) do
    conn
    |> resp(301, "")
    |> put_resp_header("location", to || "/")
  end
end
