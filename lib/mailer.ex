defmodule Mailer do
  use Bamboo.Mailer, otp_app: :shorty

  defmodule Confirm do
    import Bamboo.Email

    defp from, do: Application.get_env(:shorty, Mailer)[:username] || ""

    def send(ch_req, link) do
      case build(ch_req, link) do
        {recipient, body} ->
          new_email(
            to: recipient,
            from: {"Shorty app", from()},
            subject: "Short link change request",
            text_body: body
          )
          |> Mailer.deliver_later()

          :ok

        :error ->
          :error
      end
    end

    defp build(ch_req, link) do
      with %{new_id: new, id: token} <- ch_req,
           %{owner_mail: recipient, url: url} <- link do
        {recipient,
         "Request to edit a short link /#{new} (to #{url}) was sent to your email.\nEnter confirmation code:\n\n#{
           token
         }\n\nto complete this operation.\n\nIf you did not make a request, ignore this letter."}
      else
        _ -> :error
      end
    end
  end
end
