# Shorty
Short link service written in elixir and svelte

## Requirements
- Latest elixir and erlang/OTP installed
- Installed and runnig PostgreSQL
- Installed inotify-tools for linux

## Install
```Bash
git clone https://github.com/ddidwyll/shorty.git
cd shorty
# get deps
mix deps.get
# run migration (you may change postgres user and pass in config/*.ex)
mix ecto.create
mix ecto.migrate
# you can change smtp provider by editing config/config.ex
# build
SMTP_USERNAME=your_mail@yandex.ru SMTP_PASSWORD=pass mix release
# start
_build/dev/rel/shorty/bin/shorty daemon
```
## Client
At this moment, client does not have all dependencies, so ready-made builds are included. 

You can see source code [here](https://github.com/ddidwyll/shorty/tree/master/priv/client/src)
