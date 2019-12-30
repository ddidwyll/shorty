defmodule Links.ChangeRequest do
  use Ecto.Schema

  alias Links.Token
  alias NaiveDateTime, as: NDT
  alias Links.ChangeRequest, as: ChReq
  alias Ecto.Schema.Metadata

  @type t :: %ChReq{
          __meta__: Metadata.t(),
          id: Token.t(),
          created: NDT.t() | nil,
          old_id: Token.t(),
          new_id: Token.t()
        }

  @primary_key {:id, Token, autogenerate: true}
  @timestamps_opts inserted_at: :created, updated_at: false
  schema "change_requests" do
    field(:old_id, Token)
    field(:new_id, Token)

    timestamps()
  end
end
