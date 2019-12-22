defmodule Links.Repo.Migrations.Setup do
  use Ecto.Migration

  def change do
    create table(:links, primary_key: false) do
      add :id, :string, primary_key: true
      add :url, :string, null: false
      add :owner_mail, :text
      add :confirm_token, :string
    end
  
    create table(:change_requests, primary_key: false) do
      add :id, :string, primary_key: true
      add :old_link, :string, null: false
      add :new_link, :string, null: false
      add :created, :naive_datetime
    end
  end
end
