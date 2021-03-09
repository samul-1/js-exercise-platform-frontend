<template>
  <div id="app" ref="app" class="flex flex-col h-screen">
    <link
      rel="stylesheet"
      href="https://use.fontawesome.com/releases/v5.15.2/css/all.css"
      integrity="sha384-vSIIfh2YWi9wW0r9iZe7RJPrKwp6bG+s9QZMoITbCckVJqGCCRhc+ccxNcdpHuYu"
      crossorigin="anonymous"
    />
    <nav class="flex w-full p-3 text-white bg-gray-900">Username</nav>

    <!--<div id="nav">
      <router-link to="/">Editor</router-link> |
      <router-link to="/about">About</router-link>
    </div>-->
    <main class="my-auto"><router-view /></main>
    <footer class="flex w-full p-3 text-white bg-gray-900">
      Powered by
      <a
        class="ml-1 font-medium text-blue-300 hover:underline"
        href="http://bsamu.it"
        >Samuele Bonini</a
      >
    </footer>
  </div>
</template>

