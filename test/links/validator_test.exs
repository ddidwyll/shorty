defmodule Links.ValidatorTest do
  use ExUnit.Case, async: true
  use LinksStubs

  setup_all do
    Hammox.protect(Links.Validator, Links.ValidatorBehaviour, build_link: 2)
  end

  test "build_link valid url and email", %{build_link_2: build_link_2} do
    assert {:ok, %Link{owner_mail: @valid_email, url: @valid_url}} =
             build_link_2.(@valid_url, @valid_email)
  end

  test "build_link valid url without email", %{build_link_2: build_link_2} do
    assert {:ok, %Link{owner_mail: nil, url: @valid_url}} = build_link_2.(@valid_url, nil)
  end

  test "build_link invalid url", %{build_link_2: build_link_2} do
    assert {:error, err} = build_link_2.(@invalid_url, nil)
    assert err =~ "#{@invalid_url} is not valid url"
  end

  test "build_link invalid email", %{build_link_2: build_link_2} do
    assert {:error, err} = build_link_2.(@valid_url, @invalid_email)
    assert err =~ "#{@invalid_email} is not valid email"
  end

  test "build_link short email", %{build_link_2: build_link_2} do
    assert {:ok, %Link{owner_mail: @valid_email_short, shadow_mail: @shadow_short}} =
             build_link_2.(@valid_url, @valid_email_short)
  end
end
