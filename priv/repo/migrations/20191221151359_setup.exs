defmodule Links.Repo.Migrations.Setup do
  use Ecto.Migration

  def change do
    create table(:links, primary_key: false) do
      add :id, :string, primary_key: true
      add :url, :string, null: false
      add :owner_mail, :text
      add :shadow_mail, :text
      add :confirm_token, :string

      add :confirmed, :boolean, default: false
    end
  
    create table(:change_requests, primary_key: false) do
      add :id, :string, primary_key: true
      add :created, :naive_datetime

      add :old_id,
        references(:links, type: :string, on_delete: :delete_all)

      add :new_id,
        references(:links, type: :string, on_delete: :delete_all)
    end
  end
end
