defmodule Garbage do
  use GenServer

  import Links
  import Process
  import GenServer

  def init(_) do
    collect()
    {:ok, nil}
  end

  def handle_info(:collect, _) do
    expire_request()
    collect()
    {:noreply, nil}
  end

  def start_link(_),
    do: start_link(__MODULE__, nil)

  defp collect,
    do: send_after(self(), :collect, 3600000)
end
