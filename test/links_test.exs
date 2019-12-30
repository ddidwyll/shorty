defmodule LinksTest do
  use ExUnit.Case, async: true
  use LinksStubs

  setup do
    Ecto.Adapters.SQL.Sandbox.checkout(Links.Repo)
  end

  setup_all do
    Hammox.protect(Links, LinksBehaviour,
      create: [1, 2],
      get_link: [1, 2],
      instant_change: 3,
      request_change: 3,
      confirm_request: 1,
      cancel_change: 1,
      expire_requests: 0
    )
  end

  test "links life cycle", %{
    create_1: create_1,
    create_2: create_2,
    get_link_2: get_link_2,
    get_link_1: get_link_1,
    instant_change_3: instant_change_3,
    request_change_3: request_change_3,
    confirm_request_1: confirm_request_1,
    cancel_change_1: cancel_change_1
  } do
    assert {:ok, %Link{id: id}} = create_1.(@confirmed_link)
    assert {:ok, %Link{confirm_token: token}} = get_link_1.(id)

    assert {:error, wrong_token} = instant_change_3.(id, @new_id, @wrong_token)
    assert wrong_token =~ "token #{@wrong_token} is invalid"

    assert {:ok, %Link{id: @new_id}} = instant_change_3.(id, @new_id, token)

    assert {:error, not_found} = get_link_1.(id)
    assert not_found =~ "Link /#{id} not found"

    assert {:ok, %Link{id: other_id}} = create_1.(@confirmed_link)
    assert {:ok, %Link{owner_mail: mail}} = get_link_1.(other_id)

    assert {:error, taken} = request_change_3.(other_id, @new_id, mail)
    assert taken =~ "{\"id\":\"Url /#{@new_id} taken, choose another\"}"

    assert {:error, wrong_mail} = request_change_3.(other_id, @another_id, @wrong_mail)
    assert wrong_mail =~ "mail #{@wrong_mail} is invalid"

    assert {:ok, %ChReq{id: req_id}, %Link{}} = request_change_3.(other_id, @another_id, mail)

    assert {:error, not_confirmed} = get_link_1.(@another_id)
    assert not_confirmed =~ "Link /#{@another_id} not confirmed yet"
    assert {:ok, %Link{confirmed: false}} = get_link_2.(@another_id, false)

    assert {:ok, %Link{id: @another_id}} = confirm_request_1.(req_id)
    assert {:ok, %Link{confirmed: true} = link} = get_link_1.(@another_id)

    assert {:error, "{\"message\":\"Id taken\"}"} = create_2.(link, false)

    assert :ok = cancel_change_1.(@another_id)
    assert {:error, _} = get_link_1.(@another_id)
  end

  test "constraint, violation errors", %{
    create_1: create_1
  } do
    ch_req = %ChReq{old_id: "fake_id", new_id: "fake_id"}

    assert {:error, err} = create_1.(ch_req)
    assert err =~ "foreign_key_constraint"

    assert_raise Postgrex.Error, ~r/not_null_violation/, fn ->
      create_1.(%Link{url: nil})
    end
  end

  test "garbage collector", %{
    expire_requests_0: expire_requests_0,
    confirm_request_1: confirm_request_1,
    request_change_3: request_change_3,
    create_1: create_1
  } do
    Application.put_env(:shorty, :request_expires_sec, 0)

    assert {:ok, %Link{id: id, owner_mail: mail}} = create_1.(@confirmed_link)
    assert {:ok, %ChReq{id: req_id}, _} = request_change_3.(id, @new_id, mail)

    :timer.sleep(1111)
    expire_requests_0.()

    assert {:error, err} = confirm_request_1.(req_id)
    assert err =~ "Token is expired"
  end
end
