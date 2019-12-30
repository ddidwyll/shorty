defmodule Garbage do
  use GenServer

  import Links
  import Process
  import GenServer
  import Application

  def start_link(_),
    do: start_link(__MODULE__, nil)

  def init(_) do
    collect()
    {:ok, nil}
  end

  def handle_info(:collect, _) do
    expire_requests()
    collect()
    {:noreply, nil}
  end

  defp collect do
    expires = get_env(:shorty, :request_expires_sec, 3600)
    send_after(self(), :collect, expires * 1000)
  end
end
