defmodule Mailer.ConfirmTest do
  use ExUnit.Case
  use Bamboo.Test
  use LinksStubs

  setup_all do
    Hammox.protect(Mailer.Confirm, Mailer.ConfirmBehaviour, send: 4)
  end

  test "send confirm email", %{send_4: send_4} do
    Application.put_env(:shorty, Mailer, username: "bob", adapter: Bamboo.TestAdapter)

    assert {:ok, mail} = send_4.(@new_id, @request_token, @valid_url, @valid_email)
    assert %Bamboo.Email{from: {"Shorty app", "bob"}} = mail
  end

  test "send without smtp creds", %{send_4: send_4} do
    Application.put_env(:shorty, Mailer, username: nil)

    assert {:error, err} = send_4.(@new_id, @request_token, @valid_url, @valid_email)
    assert err =~ "try again later"
  end
end
