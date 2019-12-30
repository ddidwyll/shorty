defmodule Mailer do
  use Bamboo.Mailer, otp_app: :shorty

  defmodule ConfirmBehaviour do
    @callback send(binary, binary, binary, binary) ::
                {:ok, Bamboo.Email.t() | struct} | {:error, binary}
  end

  defmodule Confirm do
    @behaviour Mailer.ConfirmBehaviour

    import Bamboo.Email
    import Application, only: [get_env: 2]

    @error ~s/{"message":"I can't send confirmation, try again later"}/

    def send(new_id, token, url, recipient) do
      with from <- get_env(:shorty, Mailer)[:username],
           false <- is_nil(from) do
        try do
          {:ok,
           new_email(
             to: recipient,
             from: {"Shorty app", from},
             subject: "Short link change request",
             text_body: body(new_id, token, url)
           )
           |> Mailer.deliver_now()}
        catch
          _ -> {:error, @error}
        end
      else
        _ -> {:error, @error}
      end
    end

    defp body(new_id, token, url) do
      "Request to edit a short link /#{new_id} (to #{url}) was sent to your email.\nEnter confirmation code:\n\n#{
        token
      }\n\nto complete this operation.\n\nIf you did not make a request, ignore this letter."
    end
  end
end
