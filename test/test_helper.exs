ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(Links.Repo, :manual)

defmodule LinksStubs do
  defmacro __using__(_) do
    quote do
      alias Links.Link
      alias Links.ChangeRequest, as: ChReq
      alias Ecto.ConstraintError, as: DBErr

      @valid_url "http://example.com"
      @invalid_url "example.com"
      @valid_email "mail@example.com"
      @shadow_email "m**l@e*****e.com"
      @valid_email_short "ma@exa.com"
      @shadow_short "**@e**.com"
      @invalid_email "mailexample.com"

      @another_id "another_id"
      @new_id "new_id"
      @exists_id "exists_id"
      @wrong_token "wrong_token"
      @wrong_mail "wrong_mail"
      @confirm_token "confirm_token"
      @request_token "request_token"

      @confirmed_link %Links.Link{
        url: @valid_url,
        owner_mail: @valid_email,
        shadow_mail: @shadow_email,
        confirmed: true
      }

      @exists_link %Links.Link{
        @confirmed_link
        | id: @exists_id,
          confirm_token: @confirm_token
      }

      @request_change %ChReq{
        id: @request_token,
        new_id: @new_id,
        old_id: @exists_id
      }
    end
  end
end
