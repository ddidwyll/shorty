defmodule RouterTest do
  use ExUnit.Case, async: true
  use LinksStubs
  use Plug.Test

  import Router, only: [call: 2]
  import Application, only: [put_env: 3]
  import Hammox, only: [defmock: 2, expect: 4]

  setup_all do
    put_env(:shorty, :links_mod, LinksMock)
    put_env(:shorty, :validator_mod, ValidatorMock)
    put_env(:shorty, :mailer_mod, MailerConfirmMock)

    defmock(LinksMock, for: LinksBehaviour)
    defmock(ValidatorMock, for: Links.ValidatorBehaviour)
    defmock(MailerConfirmMock, for: Mailer.ConfirmBehaviour)

    :ok
  end

  test "static" do
    conn =
      conn(:get, "/")
      |> call(nil)

    assert conn.status == 200
    assert conn.resp_body =~ "html"
  end

  test "redirect to exists link" do
    expect(LinksMock, :get_link, 1, fn @exists_id ->
      {:ok, @exists_link}
    end)

    conn =
      conn(:get, "/" <> @exists_id)
      |> call(nil)

    assert conn.status == 301
    assert {"location", @valid_url} in conn.resp_headers
  end

  test "redirect to non-exists link" do
    expect(LinksMock, :get_link, 1, fn "not_exists" ->
      {:error, "not_found"}
    end)

    conn =
      conn(:get, "/" <> "not_exists")
      |> call(nil)

    assert conn.status == 301
    assert {"location", "/#search?not_exists"} in conn.resp_headers
  end

  test "get exists link" do
    expect(LinksMock, :get_link, 1, fn @exists_id, _ ->
      {:ok, @exists_link}
    end)

    conn =
      conn(:get, "/get/" <> @exists_id)
      |> call(nil)

    assert conn.status == 200
    assert conn.resp_body =~ @valid_url
    assert conn.resp_body =~ @shadow_email
    assert conn.resp_body =~ @exists_id
  end

  test "get non-exists link" do
    expect(LinksMock, :get_link, 1, fn "not_exists", _ ->
      {:error, "not_found"}
    end)

    conn =
      conn(:get, "/get/" <> "not_exists")
      |> call(nil)

    assert conn.status == 404
    assert conn.resp_body == "not_found"
  end

  test "create valid link" do
    expect(ValidatorMock, :build_link, 1, fn @valid_url, @valid_email ->
      {:ok, @confirmed_link}
    end)

    expect(LinksMock, :create, 1, fn @confirmed_link ->
      {:ok, @exists_link}
    end)

    json = ~s/{"mail":"#{@valid_email}","url":"#{@valid_url}"}/

    conn =
      conn(:post, "/create", json)
      |> put_req_header("content-type", "application/json")
      |> call(nil)

    assert conn.status == 200
    assert conn.resp_body =~ @valid_url
    assert conn.resp_body =~ @valid_email
    assert conn.resp_body =~ @exists_id
  end

  test "create invalid link" do
    expect(ValidatorMock, :build_link, 1, fn "invalid", _ ->
      {:error, "invalid"}
    end)

    json = ~s/{"url":"invalid"}/

    conn =
      conn(:post, "/create", json)
      |> put_req_header("content-type", "application/json")
      |> call(nil)

    assert conn.status == 400
    assert conn.resp_body =~ "invalid"
  end

  test "change link" do
    expect(LinksMock, :instant_change, 1, fn @exists_id, @new_id, @confirm_token ->
      {:ok, %{@exists_link | id: @new_id}}
    end)

    json = ~s/{"token":"#{@confirm_token}","id":"#{@new_id}","old":"#{@exists_id}"}/

    conn =
      conn(:post, "/change", json)
      |> put_req_header("content-type", "application/json")
      |> call(nil)

    assert conn.status == 200
    assert conn.resp_body =~ @valid_url
    assert conn.resp_body =~ @valid_email
    assert conn.resp_body =~ @new_id
  end

  test "change link with wrong data" do
    expect(LinksMock, :instant_change, 1, fn "wrong", "wrong", "wrong" ->
      {:error, "error"}
    end)

    json = ~s/{"token":"wrong","id":"wrong","old":"wrong"}/

    conn =
      conn(:post, "/change", json)
      |> put_req_header("content-type", "application/json")
      |> call(nil)

    assert conn.status == 400
    assert conn.resp_body == "error"
  end

  test "request change link" do
    expect(LinksMock, :request_change, 1, fn @exists_id, @new_id, @valid_email ->
      {:ok, @request_change, %{@exists_link | id: @new_id}}
    end)

    expect(MailerConfirmMock, :send, 1, fn @new_id, @request_token, @valid_url, @valid_email ->
      {:ok, %Bamboo.Email{}}
    end)

    json = ~s/{"mail":"#{@valid_email}","id":"#{@new_id}","old":"#{@exists_id}"}/

    conn =
      conn(:post, "/request", json)
      |> put_req_header("content-type", "application/json")
      |> call(nil)

    assert conn.status == 200
    assert conn.resp_body =~ "Check your mail"
  end

  test "request change link with wrong data" do
    expect(LinksMock, :request_change, 1, fn "wrong", "wrong", "wrong" ->
      {:error, "error"}
    end)

    expect(LinksMock, :cancel_change, 1, fn "wrong" ->
      :ok
    end)

    json = ~s/{"mail":"wrong","id":"wrong","old":"wrong"}/

    conn =
      conn(:post, "/request", json)
      |> put_req_header("content-type", "application/json")
      |> call(nil)

    assert conn.status == 400
    assert conn.resp_body == "error"
  end

  test "confirm change request" do
    expect(LinksMock, :confirm_request, 1, fn @request_token ->
      {:ok, @exists_link}
    end)

    json = ~s/{"token":"#{@request_token}"}/

    conn =
      conn(:post, "/confirm", json)
      |> put_req_header("content-type", "application/json")
      |> call(nil)

    assert conn.status == 200
    assert conn.resp_body =~ @valid_url
    assert conn.resp_body =~ @valid_email
    assert conn.resp_body =~ @exists_id
  end

  test "confirm change request with wrong token" do
    expect(LinksMock, :confirm_request, 1, fn "wrong_token" ->
      {:error, "error"}
    end)

    json = ~s/{"token":"wrong_token"}/

    conn =
      conn(:post, "/confirm", json)
      |> put_req_header("content-type", "application/json")
      |> call(nil)

    assert conn.status == 400
    assert conn.resp_body == "error"
  end
end
