<Container small scrolly>
  <h2>
    <span>S</span>
    <span>h</span>
    <span>o</span>
    <span>r</span>
    <span>t</span>
    <span>y</span>
  </h2>
  <p>При создании короткой ссылки, её параметры (с одноразовым токеном для последуюшего редактирования), сохраняются в localStorage браузера</p>
  <p>При указании почты есть возможность редактировать ссылку на другом устройстве или браузере, для этого необходимо найти её в разделе
  <a href="/#search">поиск</a>, затем перейти в режим редактирования, указать адрес почты с которым она была создана и скопировать код подтверждения,
  пришедший вам в папку спам :)</p>
  <p>Если разрешить приложению доступ к буферу обмена, работа с ним будет немного удобнее</p>
  <p>Логика клиентской части написана с использованием <a href="https://ru.svelte.dev/" target="_blank">Svelte</a> и в сжатом виде занимает ~12KB</p>
  <p>Сервер написан на <a href="https://elixirschool.com/ru" target="_blank">Elixir</a>, у АПИ нет лимитов, пожалуйста не пользуйтесь этим</p>
  <p>Исходный код и инструкция по установке <a href="https://github.com/ddidwyll/shorty" target="_blank">тут</a></p>
</Container>

<script>
  import { Container } from 'forui'
</script>

<style>
  span {
    animation: pulse 6s infinite;
  }
  span:nth-child(1) {
    animation-delay: 120s;
  }
  span:nth-child(2) {
    animation-delay: 121s;
  }
  span:nth-child(3) {
    animation-delay: 122s;
  }
  span:nth-child(4) {
    animation-delay: 123s;
  }
  span:nth-child(5) {
    animation-delay: 124s;
  }
  span:nth-child(6) {
    animation-delay: 125s;
  }
  a {
    animation: pulse 120s infinite;
  }
  @keyframes pulse {
    0% {
      color: #673AB7;
    }
    50% {
      color: #FF4081;
    }
    100% {
      color: #673AB7;
    }
  }
</style>
