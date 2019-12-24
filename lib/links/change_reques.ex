defmodule Links.ChangeRequest do
  use Ecto.Schema

  alias Links.Token

  @primary_key {:id, Token, autogenerate: true}
  @timestamps_opts inserted_at: :created, updated_at: false
  schema "change_requests" do
    field(:old_id, Token)
    field(:new_id, Token)

    timestamps()
  end
end
