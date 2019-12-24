defmodule Router do
  use Plug.Router

  import Links

  @client_dir Application.get_env(:shorty, :client_dir)

  plug(Plug.Static, at: "/static", from: @client_dir)

  plug(:match)
  plug(:dispatch)

  get "/" do
    conn = put_resp_content_type(conn, "text/html")
    send_file(conn, 200, @client_dir <> "/index.html")
  end

  get _ do
    id = get_path(conn)

    case get_link(id) do
      {:ok, %{url: url}} -> redirect(conn, url)
      _ -> redirect(conn, "/#404?" <> id)
    end
  end

  defp get_path(conn) do
    import String, only: [trim: 2]
    
    conn.request_path
    |> trim("/")
  end

  defp redirect(conn, to \\ nil) do
    conn
    |> resp(301, "")
    |> put_resp_header("location", to || "/#404")
  end
end
