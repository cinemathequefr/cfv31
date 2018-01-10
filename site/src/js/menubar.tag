<menubar>

  <div class="menu-wrapper">
    <div class="menu-container">
      <a class="logocf" href="javascript: void 0;">La Cinémathèque française</a>
      <form class="menu-search { focus: searchHasFocus }" onsubmit={ searchSubmit }>
        <input class="search-input" type="text" onblur={ searchSetBlur } onfocus={ searchSetFocus }><input class="search-submit" type="submit">
      </form>
      <div class="menu-top">
        <a href="javascript: void 0;" each={ item in items.top } onclick={ select } class={ selected: isSelectedItem(item) }>{ item.title }</a>
      </div>
      <div class="menu-bottom">
        <a href="javascript: void 0;" each={ item in items.bottom } onclick={ select } class={ selected: isSelectedItem(item) }>{ item.title }</a>
        <div class="search"></div>
      </div>
    </div>
  </div>

  <script>
  var tag = this;
  tag.selectedItem = null;
  tag.searchHasFocus = false;

  tag.items = _({
    top: [
      { title: "Collections" },
      { title: "Professionnels" },
      { title: "Presse" },
      { title: "Groupes" }
    ],
    bottom: [
      { title: "Événements" },
      { title: "Exposition" },
      { title: "Musée" },
      { title: "Bibliothèque" },
      { title: "Découvrir" },
      { title: "Infos pratiques" },
      { title: "Calendrier" },
    ]
  })
  .mapValues(i =>
    _(i).map(j =>
      _({}).assign(j, {
        id: _.kebabCase(j.title) 
      }).value()
    ).value()
  ).value();

  tag.isSelectedItem = function (item) { // Inspired by https://robertwpearce.com/blog/riotjs-example.html
    return item.id === tag.selectedItem;
  }

  tag.select = function (e) {
    tag.selectedItem = e.item.item.id;
    return true;
  }

  tag.searchSubmit = function (e) {
    tag.searchSetFocus();
    e.preventDefault();
  }

  tag.searchSetFocus = function (e) {
    tag.searchHasFocus = true;
  }

  tag.searchSetBlur = function (e) {
    tag.searchHasFocus = false;
  }


  </script>

  <style>
    a {
      color: inherit;
      text-decoration: none;
    }

    input {
      vertical-align: middle;
    }

    .menu-wrapper {
      width: 100%;
      background-color: #333;
      color: #ddd;
    }

    .menu-container {
      position: relative;
      width: 1140px; height: 200px; margin: 0 auto;
      font-family: Quicksand; font-weight: 700; font-size: 14px; text-transform: uppercase;
    }

    .menu-search {
      position: absolute;
      right: 4px; top: 4px;/* height: 32px;*/
    }

    .menu-search .search-input {
      display: inline-block;
      width: 300px; height: 20px; line-height: 20px;
      margin: 0; border: 0; padding: 8px;
      background-color: #555; color: #999;
      font-size: 1rem; font-weight: 600;
      transition: 0.15s;
    }

    .menu-search.focus .search-input {
      background-color: #eee; color: #111;
    }

    .menu-search .search-submit {
      display: inline-block; line-height: 20px;
      width: 36px; height: 36px;
      margin: 0; padding: 0; border: 0;
      background: url("data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiB2aWV3Qm94PSIwIDAgNDggNDgiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yOS41NCAyMy44OWMwLTEuNTYtMC41Ni0yLjg5LTEuNjYtMy45OXMtMi40NC0xLjY2LTMuOTktMS42NiAtMi44OSAwLjU1LTMuOTkgMS42NiAtMS42NiAyLjQ0LTEuNjYgNCAwLjU1IDIuODkgMS42NiAzLjk5YzEuMTEgMS4xMSAyLjQ0IDEuNjYgNCAxLjY2czIuODktMC41NiAzLjk5LTEuNjZDMjguOTggMjYuNzcgMjkuNTQgMjUuNDQgMjkuNTQgMjMuODl6TTM2IDM0LjM5YzAgMC40NC0wLjE2IDAuODItMC40OCAxLjE0QzM1LjIgMzUuODQgMzQuODIgMzYgMzQuMzkgMzZjLTAuNDUgMC0wLjgzLTAuMTYtMS4xMy0wLjQ4bC00LjMzLTQuMzFjLTEuNTEgMS4wNC0zLjE4IDEuNTYtNS4wMyAxLjU2IC0xLjIgMC0yLjM1LTAuMjMtMy40NS0wLjcgLTEuMS0wLjQ3LTIuMDQtMS4xLTIuODQtMS44OSAtMC43OS0wLjc5LTEuNDMtMS43NC0xLjg5LTIuODRDMTUuMjMgMjYuMjQgMTUgMjUuMDkgMTUgMjMuODlzMC4yMy0yLjM1IDAuNy0zLjQ1YzAuNDctMS4xIDEuMS0yLjA0IDEuODktMi44NCAwLjgtMC43OSAxLjc0LTEuNDMgMi44NC0xLjg5QzIxLjUzIDE1LjIzIDIyLjY4IDE1IDIzLjg5IDE1czIuMzUgMC4yMyAzLjQ1IDAuN2MxLjEgMC40NyAyLjA1IDEuMSAyLjg0IDEuODkgMC44IDAuOCAxLjQzIDEuNzQgMS44OSAyLjg0IDAuNDcgMS4xIDAuNyAyLjI1IDAuNyAzLjQ1IDAgMS44NS0wLjUyIDMuNTMtMS41NiA1LjA0bDQuMzMgNC4zM0MzNS44NCAzMy41NiAzNiAzMy45NCAzNiAzNC4zOXoiLz48L3N2Zz4=") no-repeat;
      background-size: contain; background-color: #4d4d4d;
      background-position: 50% 50%;
      font-size: 0;
      cursor: pointer;
      transition: 0.15s;
    }

    .menu-search.focus .search-submit {
      background-color: #bf7f30;
    }




    .menu-top {
      position: absolute; overflow: hidden;
      right: 4px; bottom: 50px;
      font-size: 12px; font-weight: 400;
    }
    .menu-top a { display: inline-block; padding: 12px 0px 4px 0px; margin: 0 4px; border-bottom: solid 1px transparent; transition: 0.1s; }
    .menu-top a:hover { border-color: #ddd; }
    .menu-top a.selected { color: #fff; border-color: #ddd; }

    .menu-bottom {
      position: absolute; overflow: hidden;
      right: 0; bottom: 0;
      font-size: 16px;
    }
    .menu-bottom a { display: inline-block; padding: 15px 6px; transition: 0.1s; }
    .menu-bottom a:hover { background-color: #514f4c; }
    .menu-bottom a.selected { background-color: #514f4c; color: #e5a15c; }

    .vr {
      display: inline-block;
      border-left: solid 1px #999;
      margin: 4px 2px 0 2px;
      height: 12px;
    }

    .menu-bottom a.icon-search {
      display: inline-block;
      width: 48px; height: 48px; margin: 0 0 -18px 0; padding: 0;
      background: url("data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiB2aWV3Qm94PSIwIDAgNDggNDgiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yOS41NCAyMy44OWMwLTEuNTYtMC41Ni0yLjg5LTEuNjYtMy45OXMtMi40NC0xLjY2LTMuOTktMS42NiAtMi44OSAwLjU1LTMuOTkgMS42NiAtMS42NiAyLjQ0LTEuNjYgNCAwLjU1IDIuODkgMS42NiAzLjk5YzEuMTEgMS4xMSAyLjQ0IDEuNjYgNCAxLjY2czIuODktMC41NiAzLjk5LTEuNjZDMjguOTggMjYuNzcgMjkuNTQgMjUuNDQgMjkuNTQgMjMuODl6TTM2IDM0LjM5YzAgMC40NC0wLjE2IDAuODItMC40OCAxLjE0QzM1LjIgMzUuODQgMzQuODIgMzYgMzQuMzkgMzZjLTAuNDUgMC0wLjgzLTAuMTYtMS4xMy0wLjQ4bC00LjMzLTQuMzFjLTEuNTEgMS4wNC0zLjE4IDEuNTYtNS4wMyAxLjU2IC0xLjIgMC0yLjM1LTAuMjMtMy40NS0wLjcgLTEuMS0wLjQ3LTIuMDQtMS4xLTIuODQtMS44OSAtMC43OS0wLjc5LTEuNDMtMS43NC0xLjg5LTIuODRDMTUuMjMgMjYuMjQgMTUgMjUuMDkgMTUgMjMuODlzMC4yMy0yLjM1IDAuNy0zLjQ1YzAuNDctMS4xIDEuMS0yLjA0IDEuODktMi44NCAwLjgtMC43OSAxLjc0LTEuNDMgMi44NC0xLjg5QzIxLjUzIDE1LjIzIDIyLjY4IDE1IDIzLjg5IDE1czIuMzUgMC4yMyAzLjQ1IDAuN2MxLjEgMC40NyAyLjA1IDEuMSAyLjg0IDEuODkgMC44IDAuOCAxLjQzIDEuNzQgMS44OSAyLjg0IDAuNDcgMS4xIDAuNyAyLjI1IDAuNyAzLjQ1IDAgMS44NS0wLjUyIDMuNTMtMS41NiA1LjA0bDQuMzMgNC4zM0MzNS44NCAzMy41NiAzNiAzMy45NCAzNiAzNC4zOXoiLz48L3N2Zz4=") no-repeat;
      background-size: contain;
      background-position: 50% 50%;
      font-size: 0;
      box-sizing: border-box;
    }

    .menu-bottom a.icon-search:hover { background-color: #514f4c; }

    .logocf {
      position: absolute; display: block;
      width: 301px; height: 64px;
      bottom: 0; left: 0;
      padding: 0 0 11px 0;
      background: url("data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjMwMSIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDMwMSA2NCI+PHBvbHlnb24gZmlsbD0iI2ZmZiIgcG9pbnRzPSIxNy4xNiA0NC4xOSA1LjczIDQ0LjE5IDAgMzguNTMgMCA5LjkyIDUuNzMgNC4xOSAxNy4xNiA0LjE5IDIyLjg5IDkuOTIgMjIuODkgMTguNTEgMTQuMzEgMTguNTEgMTQuMzEgMTIuNzcgOC41OCAxMi43NyA4LjU4IDM1LjY3IDE0LjMxIDM1LjY3IDE0LjMxIDI5Ljk0IDIyLjg5IDI5Ljk0IDIyLjg5IDM4LjUyICIvPjxyZWN0IHg9IjI3LjA2IiB5PSIwLjE2IiBmaWxsPSIjZmZmIiB3aWR0aD0iOC41NiIgaGVpZ2h0PSI0MCIvPjxwb2x5Z29uIGZpbGw9IiNmZmYiIHBvaW50cz0iNTQuMzMgNDQuMTggNDguNiAyOC4yMyA0OC42IDQ0LjE4IDQwLjAzIDQ0LjE4IDQwLjAzIDQuMTggNDguNiA0LjE4IDU0LjMzIDIwLjIxIDU0LjMzIDQuMTggNjIuOTEgNC4xOCA2Mi45MSA0NC4xOCAiLz48cG9seWdvbiBmaWxsPSIjZmZmIiBwb2ludHM9IjY3LjA5IDQ0LjEyIDY3LjA5IDQuMTIgODcuMTMgNC4xMiA4Ny4xMyAxMi43IDc1LjY3IDEyLjcgNzUuNjcgMTkuODYgODcuMTMgMTkuODYgODcuMTMgMjguNDQgNzUuNjcgMjguNDQgNzUuNjcgMzUuNiA4Ny4xMyAzNS42IDg3LjEzIDQ0LjEyICIvPjxwb2x5Z29uIGZpbGw9IiNmZmYiIHBvaW50cz0iMTExLjM5IDQ0LjEyIDExMS4zOSAyOS44NyAxMDUuNjYgNDQuMTIgOTkuOTIgMjkuODcgOTkuOTIgNDQuMTIgOTEuMzQgNDQuMTIgOTEuMzQgNC4xMiA5OS45MiA0LjEyIDEwNS42NiAxOC40MyAxMTEuMzkgNC4xMiAxMTkuOTcgNC4xMiAxMTkuOTcgNDQuMTIgIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEzOS43OSA0MGwtMC45OC01LjcyaC03LjJMMTMwLjY1IDQwaC04LjUxbDcuMzktNDBoMTEuNDFsNy40MiA0MGgtOC41NmwwIDBIMTM5Ljc5ek0xMzUuMjIgMTMuMzFsLTIuMDkgMTIuNDFoNC4yMUwxMzUuMjIgMTMuMzEgMTM1LjIyIDEzLjMxeiIvPjxwb2x5Z29uIGZpbGw9IiNmZmYiIHBvaW50cz0iMTYzLjc5IDEyLjcgMTYzLjc5IDQ0LjEyIDE1NS4yMSA0NC4xMiAxNTUuMjEgMTIuNyAxNDYuNiAxMi43IDE0Ni42IDQuMTIgMTcyLjM3IDQuMTIgMTcyLjM3IDEyLjcgIi8+PHBvbHlnb24gZmlsbD0iI2ZmZiIgcG9pbnRzPSIxODkuMTMgNDQuMTIgMTg5LjEzIDI4LjQ0IDE4My40IDI4LjQ0IDE4My40IDQ0LjEyIDE3NC44MiA0NC4xMiAxNzQuODIgNC4xMiAxODMuNCA0LjEyIDE4My40IDE5Ljg2IDE4OS4xMyAxOS44NiAxODkuMTMgNC4xMiAxOTcuNzEgNC4xMiAxOTcuNzEgNDQuMTIgIi8+PHBvbHlnb24gZmlsbD0iI2ZmZiIgcG9pbnRzPSIyMDEuODggNDQuMTIgMjAxLjg4IDQuMTIgMjIxLjkyIDQuMTIgMjIxLjkyIDEyLjcgMjEwLjQ2IDEyLjcgMjEwLjQ2IDE5Ljg2IDIyMS45MiAxOS44NiAyMjEuOTIgMjguNDQgMjEwLjQ2IDI4LjQ0IDIxMC40NiAzNS42IDIyMS45MiAzNS42IDIyMS45MiA0NC4xMiAiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjMxLjg2IDQ0LjA3bC01LjczLTUuNjdWOS43OWw1LjczLTUuNzNoMTEuNDNsNS43MyA1LjczVjM1LjU0bC0yLjg1IDIuODVoNS4xNHY1LjY4SDIzMS44NmwwIDAgMCAwSDIzMS44NnpNMjQwLjQ0IDEyLjY1aC01LjczVjM1LjU0aDUuNzNWMTIuNjV6Ii8+PHBvbHlnb24gZmlsbD0iI2ZmZiIgcG9pbnRzPSIyNzAuMzMgNDAuMTYgMjU4LjkyIDQwLjE2IDI1My4yIDM0LjQ0IDI1My4yIDAuMTYgMjYxLjc2IDAuMTYgMjYxLjc2IDMxLjYgMjY3LjQ4IDMxLjYgMjY3LjQ4IDAuMTYgMjc2LjA0IDAuMTYgMjc2LjA0IDM0LjQ0ICIvPjxwb2x5Z29uIGZpbGw9IiNmZmYiIHBvaW50cz0iMjgwLjI2IDQ0LjEyIDI4MC4yNiA0LjEyIDMwMC4zIDQuMTIgMzAwLjMgMTIuNyAyODguODQgMTIuNyAyODguODQgMTkuODYgMzAwLjMgMTkuODYgMzAwLjMgMjguNDQgMjg4Ljg0IDI4LjQ0IDI4OC44NCAzNS42IDMwMC4zIDM1LjYgMzAwLjMgNDQuMTIgIi8+PGNpcmNsZSBmaWxsPSIjNjcyRjkwIiBjeD0iMjkyLjMiIGN5PSI1NC43NyIgcj0iOCIvPjxjaXJjbGUgZmlsbD0iIzc4QzY5NiIgY3g9IjI3NS4wNCIgY3k9IjU1LjE1IiByPSI4Ii8+PHBhdGggZD0iTTI3Ny4wOCA1Mi40Yy0wLjIyIDAtMC40NiAwLTAuNzYgMC4wNCAtMS42MyAwLjE5LTIuNDIgMS4yLTIuNjEgMi4yOGgwLjA0YzAuMzgtMC40NCAwLjk3LTAuNzYgMS43NS0wLjc2IDEuMzQgMCAyLjM5IDAuOTYgMi4zOSAyLjU0IDAgMS40OS0xLjA5IDIuNzgtMi43NSAyLjc4IC0xLjg5IDAtMi45NC0xLjQ0LTIuOTQtMy4zNiAwLTEuNSAwLjU0LTIuNzIgMS4zNi0zLjUgMC43Mi0wLjY3IDEuNjYtMS4wNSAyLjc3LTEuMTUgMC4zMi0wLjA0IDAuNTYtMC4wNCAwLjc0LTAuMDJMMjc3LjA4IDUyLjR6TTI3Ni4zOSA1Ni41OGMwLTAuOS0wLjQ5LTEuNTUtMS4zNS0xLjU1IC0wLjU1IDAtMS4wNCAwLjM0LTEuMjcgMC44IC0wLjA2IDAuMTItMC4xIDAuMjYtMC4xIDAuNDcgMC4wMiAxLjAzIDAuNTIgMS44NyAxLjQ2IDEuODdDMjc1LjkgNTguMTggMjc2LjM5IDU3LjUyIDI3Ni4zOSA1Ni41OHoiLz48cGF0aCBmaWxsPSIjRjZGNkY2IiBkPSJNMjg5LjEyIDUyLjNoLTAuMDJsLTEuNDMgMC43MiAtMC4yNS0xLjEyIDEuOS0wLjk0aDEuMjR2Ny44aC0xLjQzVjUyLjN6Ii8+PHBhdGggZmlsbD0iI0Y2RjZGNiIgZD0iTTI5NS45MSA1OC43N3YtMS45OGgtMy41M3YtMC45NmwzLjE4LTQuODZoMS43NHY0LjdoMS4wMXYxLjEyaC0xLjAxdjEuOThIMjk1Ljkxek0yOTUuOTEgNTUuNjd2LTIuMTJjMC0wLjQ0IDAuMDEtMC45IDAuMDUtMS4zNWgtMC4wNWMtMC4yNCAwLjQ5LTAuNDQgMC44OS0wLjY4IDEuMzJsLTEuNDMgMi4xMyAtMC4wMSAwLjAySDI5NS45MXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTE4LjA0IDU0LjY3YzAuMzYgMC4yIDAuNjQgMC40OCAwLjg0IDAuODQgMC4yIDAuMzUgMC4zMSAwLjc1IDAuMzEgMS4xOCAwIDAuNDUtMC4xMyAwLjg2LTAuMzggMS4yNCAtMC4yNSAwLjM4LTAuNTkgMC42OC0xLjAxIDAuOTEgLTAuNDIgMC4yMi0wLjg3IDAuMzQtMS4zNiAwLjM0IC0wLjI2IDAtMC41My0wLjA0LTAuOC0wLjEyIC0wLjI4LTAuMDgtMC41LTAuMTktMC42Ny0wLjMzIC0wLjA4LTAuMDctMC4xNS0wLjE2LTAuMi0wLjI4IC0wLjA1LTAuMTItMC4wOC0wLjIzLTAuMDgtMC4zNCAwLTAuMTIgMC4wNS0wLjIzIDAuMTYtMC4zMnMwLjI0LTAuMTQgMC40MS0wLjE0YzAuMTIgMCAwLjI3IDAuMDYgMC40NSAwLjE5IDAuMjggMC4xNyAwLjUzIDAuMjYgMC43NCAwLjI2IDAuMjcgMCAwLjUzLTAuMDYgMC43Ny0wLjE5IDAuMjQtMC4xMyAwLjQzLTAuMyAwLjU3LTAuNTEgMC4xNC0wLjIxIDAuMjItMC40NCAwLjIyLTAuNjkgMC0wLjM2LTAuMTItMC42NS0wLjM3LTAuODhzLTAuNTQtMC4zNC0wLjg4LTAuMzRjLTAuMTUgMC0wLjI5IDAuMDItMC40MSAwLjA2cy0wLjI2IDAuMS0wLjQzIDAuMThjLTAuMTIgMC4wNi0wLjIxIDAuMS0wLjI4IDAuMTMgLTAuMDcgMC4wMy0wLjE0IDAuMDQtMC4yMSAwLjA0IC0wLjI2IDAtMC40NC0wLjA3LTAuNTYtMC4yMSAtMC4xMS0wLjE0LTAuMTYtMC4zMS0wLjE2LTAuNSAwLTAuMDcgMC0wLjExIDAuMDEtMC4xNGwwLjMxLTIuNDhjMC4wMy0wLjE0IDAuMS0wLjI1IDAuMjEtMC4zNCAwLjExLTAuMDkgMC4yNC0wLjEzIDAuNC0wLjEzaDIuODljMC4xNiAwIDAuMjkgMC4wNSAwLjQgMC4xNiAwLjExIDAuMTEgMC4xNiAwLjI0IDAuMTYgMC40IDAgMC4xNS0wLjA1IDAuMjgtMC4xNiAwLjM5IC0wLjExIDAuMS0wLjI0IDAuMTYtMC40IDAuMTZoLTIuNDhsLTAuMTkgMS40NWMwLjEzLTAuMDcgMC4yOS0wLjEzIDAuNDgtMC4xOCAwLjE5LTAuMDUgMC4zOC0wLjA3IDAuNTUtMC4wN0MxMTcuMjkgNTQuMzYgMTE3LjY4IDU0LjQ2IDExOC4wNCA1NC42N3oiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTIyLjYxIDUyLjI0YzAuMTEgMC4xMiAwLjE3IDAuMjYgMC4xNyAwLjQ0djUuNzhjMCAwLjE3LTAuMDYgMC4zMi0wLjE5IDAuNDQgLTAuMTMgMC4xMi0wLjI4IDAuMTgtMC40NyAwLjE4cy0wLjM0LTAuMDYtMC40Ni0wLjE3IC0wLjE4LTAuMjYtMC4xOC0wLjQzdi00Ljc0bC0wLjYyIDAuMzhjLTAuMSAwLjA2LTAuMjEgMC4wOS0wLjMyIDAuMDkgLTAuMTcgMC0wLjMxLTAuMDYtMC40Mi0wLjE5IC0wLjEyLTAuMTMtMC4xNy0wLjI3LTAuMTctMC40MiAwLTAuMTEgMC4wMy0wLjIxIDAuMDktMC4zczAuMTMtMC4xNyAwLjIzLTAuMjJsMS41MS0wLjljMC4xMS0wLjA2IDAuMjYtMC4wOSAwLjQzLTAuMDlDMTIyLjM1IDUyLjA2IDEyMi40OSA1Mi4xMiAxMjIuNjEgNTIuMjR6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyNS41MyA1OS41NmMtMC4xMSAwLjIzLTAuMjYgMC40NC0wLjQ0IDAuNjFzLTAuMzcgMC4yNi0wLjU2IDAuMjZjLTAuMTUgMC0wLjI2LTAuMDMtMC4zNS0wLjA5cy0wLjEzLTAuMTYtMC4xMy0wLjNjMC0wLjExIDAuMDMtMC4xOCAwLjA4LTAuMjIgMC4wNS0wLjA0IDAuMTEtMC4wNyAwLjE4LTAuMDlzMC4xMS0wLjA0IDAuMTQtMC4wNWMwLjE5LTAuMSAwLjI4LTAuMjMgMC4yOC0wLjQgMC0wLjA3LTAuMDQtMC4xNC0wLjEtMC4xOXMtMC4xNi0wLjA4LTAuMjgtMC4wOCAtMC4yMSAwLjAyLTAuMjggMC4wN2MtMC4wOC0wLjAzLTAuMTQtMC4wOC0wLjE4LTAuMTMgLTAuMDQtMC4wNS0wLjA2LTAuMTMtMC4wNi0wLjI0IDAtMC4xMyAwLjA1LTAuMjYgMC4xNS0wLjM3IDAuMS0wLjEyIDAuMjItMC4yMSAwLjM3LTAuMjggMC4xNS0wLjA3IDAuMjktMC4xIDAuNDMtMC4xIDAuMjkgMCAwLjUyIDAuMDkgMC42OSAwLjI4IDAuMTcgMC4xOCAwLjI1IDAuNDUgMC4yNSAwLjc5QzEyNS43IDU5LjEzIDEyNS42NCA1OS4zMyAxMjUuNTMgNTkuNTZ6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEzNS41MiA1OC4yOWMwLjA1IDAuMDkgMC4wOCAwLjE4IDAuMDggMC4yNyAwIDAuMTItMC4wNCAwLjIzLTAuMTIgMC4zMyAtMC4xIDAuMTItMC4yNSAwLjE4LTAuNDYgMC4xOCAtMC4xNiAwLTAuMzEtMC4wNC0wLjQ0LTAuMTEgLTAuNDgtMC4yNy0wLjcyLTAuODMtMC43Mi0xLjY3IDAtMC4yNC0wLjA4LTAuNDMtMC4yMy0wLjU3IC0wLjE2LTAuMTQtMC4zOC0wLjIxLTAuNjctMC4yMWgtMS44N3YxLjk0YzAgMC4xOC0wLjA1IDAuMzMtMC4xNCAwLjQ0cy0wLjIyIDAuMTctMC4zOCAwLjE3Yy0wLjE5IDAtMC4zNi0wLjA2LTAuNS0wLjE3IC0wLjE0LTAuMTItMC4yMS0wLjI2LTAuMjEtMC40M3YtNS43OGMwLTAuMTcgMC4wNi0wLjMyIDAuMTgtMC40MyAwLjEyLTAuMTIgMC4yNi0wLjE3IDAuNDQtMC4xN2gyLjg4YzAuMzUgMCAwLjY3IDAuMDkgMC45OCAwLjI4IDAuMzEgMC4xOSAwLjU1IDAuNDQgMC43NCAwLjc3IDAuMTggMC4zMyAwLjI4IDAuNjkgMC4yOCAxLjEgMCAwLjMzLTAuMDkgMC42Ni0wLjI3IDAuOTggLTAuMTggMC4zMi0wLjQxIDAuNTctMC43IDAuNzYgMC40MiAwLjI5IDAuNjUgMC42OSAwLjY5IDEuMTggMC4wMiAwLjExIDAuMDMgMC4yMSAwLjAzIDAuMzEgMC4wMyAwLjIxIDAuMDUgMC4zNiAwLjA4IDAuNDUgMC4wMyAwLjA5IDAuMDkgMC4xNiAwLjE4IDAuMjFDMTM1LjQgNTguMTMgMTM1LjQ3IDU4LjIgMTM1LjUyIDU4LjI5ek0xMzMuNjIgNTUuMzFjMC4xMS0wLjExIDAuMjEtMC4yNiAwLjI4LTAuNDVzMC4xMS0wLjM5IDAuMTEtMC42MWMwLTAuMTktMC4wNC0wLjM2LTAuMTEtMC41MXMtMC4xNy0wLjI4LTAuMjgtMC4zNyAtMC4yMy0wLjE0LTAuMzUtMC4xNGgtMi4xOXYyLjI3aDIuMTlDMTMzLjM5IDU1LjQ4IDEzMy41IDU1LjQyIDEzMy42MiA1NS4zMXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTQyLjA0IDUyLjIyYzAuMTEgMC4xMSAwLjE2IDAuMjYgMC4xNiAwLjQ0djMuNjJjMCAwLjU1LTAuMTIgMS4wNC0wLjM1IDEuNDcgLTAuMjMgMC40My0wLjU2IDAuNzYtMC45OCAxIC0wLjQyIDAuMjQtMC45IDAuMzYtMS40NCAwLjM2IC0wLjU0IDAtMS4wMi0wLjEyLTEuNDQtMC4zNiAtMC40Mi0wLjI0LTAuNzUtMC41Ny0wLjk4LTEgLTAuMjMtMC40My0wLjM1LTAuOTItMC4zNS0xLjQ3di0zLjYyYzAtMC4xNyAwLjA2LTAuMzIgMC4xOC0wLjQzIDAuMTItMC4xMiAwLjI3LTAuMTcgMC40Ni0wLjE3IDAuMTYgMCAwLjMgMC4wNiAwLjQyIDAuMThzMC4xOCAwLjI2IDAuMTggMC40NHYzLjYyYzAgMC4zMiAwLjA3IDAuNjEgMC4yMSAwLjg2IDAuMTQgMC4yNSAwLjMzIDAuNDQgMC41NiAwLjU3IDAuMjQgMC4xMyAwLjQ5IDAuMiAwLjc3IDAuMiAwLjI5IDAgMC41Ni0wLjA3IDAuODEtMC4yczAuNDUtMC4zMiAwLjYtMC41NyAwLjIzLTAuNTMgMC4yMy0wLjg1di0zLjYyYzAtMC4xOCAwLjA1LTAuMzMgMC4xNS0wLjQ0czAuMjQtMC4xNyAwLjQxLTAuMTdDMTQxLjc5IDUyLjA1IDE0MS45MyA1Mi4xMSAxNDIuMDQgNTIuMjJ6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE0OC4wOSA1OC4wOWMwLjEyIDAuMTIgMC4xOCAwLjI1IDAuMTggMC40MSAwIDAuMTctMC4wNiAwLjMtMC4xNyAwLjQxIC0wLjEyIDAuMTEtMC4yNiAwLjE2LTAuNDMgMC4xNmgtMy4zNWMtMC4xNyAwLTAuMzItMC4wNi0wLjQzLTAuMTdzLTAuMTctMC4yNi0wLjE3LTAuNDN2LTUuNzhjMC0wLjE3IDAuMDYtMC4zMiAwLjE4LTAuNDMgMC4xMi0wLjEyIDAuMjYtMC4xNyAwLjQ0LTAuMTdoMy4zNWMwLjE3IDAgMC4zMiAwLjA2IDAuNDQgMC4xN3MwLjE4IDAuMjUgMC4xOCAwLjQzYzAgMC4xNy0wLjA2IDAuMy0wLjE3IDAuNDFzLTAuMjYgMC4xNi0wLjQ0IDAuMTZoLTIuNzF2MS43aDIuMjZjMC4xNyAwIDAuMzIgMC4wNiAwLjQ0IDAuMTcgMC4xMiAwLjExIDAuMTggMC4yNSAwLjE4IDAuNDMgMCAwLjE3LTAuMDYgMC4zLTAuMTcgMC40MSAtMC4xMSAwLjEtMC4yNiAwLjE2LTAuNDQgMC4xNmgtMi4yNnYxLjg1aDIuNzFDMTQ3LjgzIDU3LjkxIDE0Ny45NyA1Ny45NyAxNDguMDkgNTguMDl6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE1Ni44MyA1Mi41M2MwLjQ1IDAuMzEgMC43OSAwLjczIDEuMDMgMS4yNiAwLjI0IDAuNTMgMC4zNiAxLjEyIDAuMzYgMS43OHMtMC4xMiAxLjI1LTAuMzUgMS43OGMtMC4yNCAwLjUzLTAuNTggMC45NS0xLjAzIDEuMjYgLTAuNDUgMC4zMS0wLjk5IDAuNDctMS42MSAwLjQ3aC0yLjM5Yy0wLjE3IDAtMC4zMi0wLjA2LTAuNDMtMC4xN3MtMC4xNy0wLjI2LTAuMTctMC40M3YtNS43OGMwLTAuMTcgMC4wNi0wLjMyIDAuMTgtMC40MyAwLjEyLTAuMTIgMC4yNi0wLjE3IDAuNDQtMC4xN2gyLjM5QzE1NS44NCA1Mi4wNiAxNTYuMzggNTIuMjIgMTU2LjgzIDUyLjUzek0xNTYuNDcgNTcuMjVjMC4zLTAuNDQgMC40NS0xIDAuNDUtMS42OHMtMC4xNS0xLjI0LTAuNDUtMS42OGMtMC4zLTAuNDQtMC43NS0wLjY2LTEuMzQtMC42NmgtMS42NXY0LjdoMS42NUMxNTUuNzIgNTcuOTEgMTU2LjE3IDU3LjY5IDE1Ni40NyA1Ny4yNXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTYzLjc2IDU4LjA5YzAuMTIgMC4xMiAwLjE4IDAuMjUgMC4xOCAwLjQxIDAgMC4xNy0wLjA2IDAuMy0wLjE3IDAuNDEgLTAuMTIgMC4xMS0wLjI2IDAuMTYtMC40MyAwLjE2aC0zLjM1Yy0wLjE3IDAtMC4zMi0wLjA2LTAuNDMtMC4xN3MtMC4xNy0wLjI2LTAuMTctMC40M3YtNS43OGMwLTAuMTcgMC4wNi0wLjMyIDAuMTgtMC40MyAwLjEyLTAuMTIgMC4yNi0wLjE3IDAuNDQtMC4xN2gzLjM1YzAuMTcgMCAwLjMyIDAuMDYgMC40NCAwLjE3czAuMTggMC4yNSAwLjE4IDAuNDNjMCAwLjE3LTAuMDYgMC4zLTAuMTcgMC40MXMtMC4yNiAwLjE2LTAuNDQgMC4xNmgtMi43MXYxLjdoMi4yNmMwLjE3IDAgMC4zMiAwLjA2IDAuNDQgMC4xNyAwLjEyIDAuMTEgMC4xOCAwLjI1IDAuMTggMC40MyAwIDAuMTctMC4wNiAwLjMtMC4xNyAwLjQxIC0wLjExIDAuMS0wLjI2IDAuMTYtMC40NCAwLjE2aC0yLjI2djEuODVoMi43MUMxNjMuNSA1Ny45MSAxNjMuNjQgNTcuOTcgMTYzLjc2IDU4LjA5eiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xNzIuOTUgNTUuODJjMC4yMiAwLjI5IDAuMzQgMC42NiAwLjM0IDEuMTEgMCAwLjc5LTAuMjMgMS4zNS0wLjY4IDEuNjYgLTAuNDUgMC4zMS0wLjk5IDAuNDctMS42MiAwLjQ3aC0yLjQ5Yy0wLjE3IDAtMC4zMi0wLjA2LTAuNDMtMC4xN3MtMC4xNy0wLjI2LTAuMTctMC40M3YtNS43OGMwLTAuMTcgMC4wNi0wLjMyIDAuMTgtMC40MyAwLjEyLTAuMTIgMC4yNi0wLjE3IDAuNDQtMC4xN2gyLjUyYzEuMjcgMCAxLjkgMC41OSAxLjkgMS43OCAwIDAuMy0wLjA3IDAuNTYtMC4yMSAwLjhzLTAuMzUgMC40MS0wLjYxIDAuNTVDMTcyLjQ0IDU1LjMyIDE3Mi43MyA1NS41MyAxNzIuOTUgNTUuODJ6TTE3MS40MSA1My40NWMtMC4xNC0wLjE0LTAuMzMtMC4yLTAuNTctMC4yaC0xLjY1djEuNTZoMS42OGMwLjIgMCAwLjM4LTAuMDcgMC41My0wLjJzMC4yMy0wLjMxIDAuMjMtMC41NEMxNzEuNjIgNTMuNzkgMTcxLjU1IDUzLjU4IDE3MS40MSA1My40NXpNMTcxLjcyIDU3LjY2YzAuMTgtMC4xNyAwLjI3LTAuNDEgMC4yNy0wLjczIDAtMC4zOS0wLjEtMC42NS0wLjMxLTAuNzdzLTAuNDYtMC4xOC0wLjc2LTAuMThoLTEuNzN2MS45M2gxLjhDMTcxLjMgNTcuOTEgMTcxLjU0IDU3LjgzIDE3MS43MiA1Ny42NnoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTc4LjgzIDU4LjA5YzAuMTIgMC4xMiAwLjE4IDAuMjUgMC4xOCAwLjQxIDAgMC4xNy0wLjA2IDAuMy0wLjE3IDAuNDEgLTAuMTIgMC4xMS0wLjI2IDAuMTYtMC40MyAwLjE2aC0zLjM1Yy0wLjE3IDAtMC4zMi0wLjA2LTAuNDMtMC4xN3MtMC4xNy0wLjI2LTAuMTctMC40M3YtNS43OGMwLTAuMTcgMC4wNi0wLjMyIDAuMTgtMC40MyAwLjEyLTAuMTIgMC4yNi0wLjE3IDAuNDQtMC4xN2gzLjM1YzAuMTcgMCAwLjMyIDAuMDYgMC40NCAwLjE3czAuMTggMC4yNSAwLjE4IDAuNDNjMCAwLjE3LTAuMDYgMC4zLTAuMTcgMC40MXMtMC4yNiAwLjE2LTAuNDQgMC4xNmgtMi43MXYxLjdoMi4yNmMwLjE3IDAgMC4zMiAwLjA2IDAuNDQgMC4xNyAwLjEyIDAuMTEgMC4xOCAwLjI1IDAuMTggMC40MyAwIDAuMTctMC4wNiAwLjMtMC4xNyAwLjQxIC0wLjExIDAuMS0wLjI2IDAuMTYtMC40NCAwLjE2aC0yLjI2djEuODVoMi43MUMxNzguNTcgNTcuOTEgMTc4LjcxIDU3Ljk3IDE3OC44MyA1OC4wOXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTg1Ljg1IDU4LjI5YzAuMDUgMC4wOSAwLjA4IDAuMTggMC4wOCAwLjI3IDAgMC4xMi0wLjA0IDAuMjMtMC4xMiAwLjMzIC0wLjEgMC4xMi0wLjI1IDAuMTgtMC40NiAwLjE4IC0wLjE2IDAtMC4zMS0wLjA0LTAuNDQtMC4xMSAtMC40OC0wLjI3LTAuNzItMC44My0wLjcyLTEuNjcgMC0wLjI0LTAuMDgtMC40My0wLjIzLTAuNTcgLTAuMTYtMC4xNC0wLjM4LTAuMjEtMC42Ny0wLjIxaC0xLjg3djEuOTRjMCAwLjE4LTAuMDUgMC4zMy0wLjE0IDAuNDRzLTAuMjIgMC4xNy0wLjM4IDAuMTdjLTAuMTkgMC0wLjM2LTAuMDYtMC41LTAuMTcgLTAuMTQtMC4xMi0wLjIxLTAuMjYtMC4yMS0wLjQzdi01Ljc4YzAtMC4xNyAwLjA2LTAuMzIgMC4xOC0wLjQzIDAuMTItMC4xMiAwLjI2LTAuMTcgMC40NC0wLjE3aDIuODhjMC4zNSAwIDAuNjcgMC4wOSAwLjk4IDAuMjggMC4zMSAwLjE5IDAuNTUgMC40NCAwLjc0IDAuNzcgMC4xOCAwLjMzIDAuMjggMC42OSAwLjI4IDEuMSAwIDAuMzMtMC4wOSAwLjY2LTAuMjcgMC45OCAtMC4xOCAwLjMyLTAuNDEgMC41Ny0wLjcgMC43NiAwLjQyIDAuMjkgMC42NSAwLjY5IDAuNjkgMS4xOCAwLjAyIDAuMTEgMC4wMyAwLjIxIDAuMDMgMC4zMSAwLjAzIDAuMjEgMC4wNSAwLjM2IDAuMDggMC40NSAwLjAzIDAuMDkgMC4wOSAwLjE2IDAuMTggMC4yMUMxODUuNzMgNTguMTMgMTg1LjggNTguMiAxODUuODUgNTguMjl6TTE4My45NSA1NS4zMWMwLjExLTAuMTEgMC4yMS0wLjI2IDAuMjgtMC40NXMwLjExLTAuMzkgMC4xMS0wLjYxYzAtMC4xOS0wLjA0LTAuMzYtMC4xMS0wLjUxcy0wLjE3LTAuMjgtMC4yOC0wLjM3IC0wLjIzLTAuMTQtMC4zNS0wLjE0aC0yLjE5djIuMjdoMi4xOUMxODMuNzIgNTUuNDggMTgzLjgzIDU1LjQyIDE4My45NSA1NS4zMXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTkyLjE0IDUyLjkxYzAgMC4xNC0wLjA1IDAuMjgtMC4xNSAwLjQxIC0wLjExIDAuMTQtMC4yNCAwLjIxLTAuNDEgMC4yMSAtMC4xMSAwLTAuMjMtMC4wMy0wLjM0LTAuMDkgLTAuMzMtMC4xNS0wLjY4LTAuMjMtMS4wNi0wLjIzIC0wLjQ3IDAtMC44NyAwLjEtMS4yMiAwLjMgLTAuMzUgMC4yLTAuNjEgMC40Ny0wLjggMC44MyAtMC4xOSAwLjM2LTAuMjggMC43Ny0wLjI4IDEuMjMgMCAwLjc5IDAuMjEgMS4zOCAwLjY0IDEuNzlzMC45OCAwLjYxIDEuNjcgMC42MWMwLjQxIDAgMC43Ni0wLjA4IDEuMDYtMC4yMyAwLjEyLTAuMDUgMC4yMy0wLjA4IDAuMzItMC4wOCAwLjE3IDAgMC4zMiAwLjA3IDAuNDQgMC4yMiAwLjEgMC4xMyAwLjE1IDAuMjYgMC4xNSAwLjQxIDAgMC4xMS0wLjAzIDAuMi0wLjA4IDAuMjkgLTAuMDUgMC4wOS0wLjEzIDAuMTUtMC4yMyAwLjIgLTAuNTIgMC4yNi0xLjA3IDAuMzktMS42NiAwLjM5IC0wLjY1IDAtMS4yNS0wLjE0LTEuOC0wLjQxIC0wLjU1LTAuMjgtMC45OC0wLjY4LTEuMzEtMS4yM3MtMC40OS0xLjE5LTAuNDktMS45NmMwLTAuNjggMC4xNi0xLjI5IDAuNDctMS44MyAwLjMxLTAuNTQgMC43NC0wLjk2IDEuMjktMS4yNiAwLjU1LTAuMyAxLjE2LTAuNDUgMS44NS0wLjQ1IDAuNTkgMCAxLjE0IDAuMTMgMS42NSAwLjM5QzE5Mi4wMyA1Mi41MSAxOTIuMTQgNTIuNjggMTkyLjE0IDUyLjkxeiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xOTguMTUgNTMuMDJsLTIuMDkgMi45OXYyLjQ0YzAgMC4xNy0wLjA2IDAuMzItMC4xNyAwLjQ0cy0wLjI1IDAuMTgtMC40MSAwLjE4Yy0wLjE3IDAtMC4zMS0wLjA2LTAuNDItMC4xN3MtMC4xNy0wLjI2LTAuMTctMC40M3YtMi41OGwtMi4wOC0yLjc2Yy0wLjEyLTAuMTYtMC4xOC0wLjMyLTAuMTgtMC40NyAwLTAuMTcgMC4wNy0wLjMyIDAuMjEtMC40M3MwLjI4LTAuMTcgMC40NC0wLjE3YzAuMTkgMCAwLjM1IDAuMDkgMC40OSAwLjI4bDEuNzYgMi40MyAxLjY1LTIuNDFjMC4xNC0wLjIgMC4zMS0wLjMgMC41LTAuMyAwLjE2IDAgMC4zIDAuMDYgMC40MiAwLjE4czAuMTggMC4yNyAwLjE4IDAuNDRDMTk4LjI2IDUyLjc4IDE5OC4yMiA1Mi45MSAxOTguMTUgNTMuMDJ6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIwMS44IDU2LjEyYy0wLjEtMC4xLTAuMTUtMC4yNS0wLjE1LTAuNDRWNTUuNWMwLTAuMTkgMC4wNS0wLjM0IDAuMTYtMC40NCAwLjEtMC4xIDAuMjUtMC4xNSAwLjQ1LTAuMTVoMC4xM2MwLjE5IDAgMC4zNCAwLjA1IDAuNDUgMC4xNiAwLjEgMC4xIDAuMTYgMC4yNSAwLjE2IDAuNDV2MC4xN2MwIDAuMTktMC4wNSAwLjM0LTAuMTUgMC40NSAtMC4xIDAuMS0wLjI1IDAuMTYtMC40NCAwLjE2aC0wLjEzQzIwMi4wNSA1Ni4yNyAyMDEuOSA1Ni4yMiAyMDEuOCA1Ni4xMnoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjExLjMyIDUyLjIzYzAuMTMgMC4xMSAwLjIgMC4yNSAwLjIgMC40MyAwIDAuMDktMC4wMiAwLjE4LTAuMDYgMC4yN2wtMi42MyA1LjgxYy0wLjA1IDAuMTItMC4xMiAwLjIxLTAuMjIgMC4yOCAtMC4xIDAuMDctMC4yMSAwLjEtMC4zMyAwLjEgLTAuMTcgMC0wLjMxLTAuMDYtMC40My0wLjE3IC0wLjEyLTAuMTEtMC4xOC0wLjI1LTAuMTgtMC40MSAwLTAuMDkgMC4wMi0wLjE4IDAuMDYtMC4yN2wyLjMzLTUuMWgtMi42NmMtMC4xNiAwLTAuMjktMC4wNS0wLjQtMC4xNiAtMC4xMS0wLjExLTAuMTYtMC4yNC0wLjE2LTAuNCAwLTAuMTUgMC4wNS0wLjI4IDAuMTYtMC4zOCAwLjExLTAuMSAwLjI0LTAuMTUgMC40LTAuMTVoMy40OEMyMTEuMDQgNTIuMDYgMjExLjE5IDUyLjEyIDIxMS4zMiA1Mi4yM3oiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjE1Ljg2IDU0LjY3YzAuMzYgMC4yIDAuNjQgMC40OCAwLjg0IDAuODQgMC4yIDAuMzUgMC4zMSAwLjc1IDAuMzEgMS4xOCAwIDAuNDUtMC4xMyAwLjg2LTAuMzggMS4yNCAtMC4yNSAwLjM4LTAuNTkgMC42OC0xLjAxIDAuOTEgLTAuNDIgMC4yMi0wLjg3IDAuMzQtMS4zNiAwLjM0IC0wLjI2IDAtMC41My0wLjA0LTAuOC0wLjEyIC0wLjI4LTAuMDgtMC41LTAuMTktMC42Ny0wLjMzIC0wLjA4LTAuMDctMC4xNS0wLjE2LTAuMi0wLjI4IC0wLjA1LTAuMTItMC4wOC0wLjIzLTAuMDgtMC4zNCAwLTAuMTIgMC4wNS0wLjIzIDAuMTYtMC4zMnMwLjI0LTAuMTQgMC40MS0wLjE0YzAuMTIgMCAwLjI3IDAuMDYgMC40NSAwLjE5IDAuMjggMC4xNyAwLjUzIDAuMjYgMC43NCAwLjI2IDAuMjcgMCAwLjUzLTAuMDYgMC43Ny0wLjE5IDAuMjQtMC4xMyAwLjQzLTAuMyAwLjU3LTAuNTEgMC4xNC0wLjIxIDAuMjItMC40NCAwLjIyLTAuNjkgMC0wLjM2LTAuMTItMC42NS0wLjM3LTAuODhzLTAuNTQtMC4zNC0wLjg4LTAuMzRjLTAuMTUgMC0wLjI5IDAuMDItMC40MSAwLjA2cy0wLjI2IDAuMS0wLjQzIDAuMThjLTAuMTIgMC4wNi0wLjIxIDAuMS0wLjI4IDAuMTMgLTAuMDcgMC4wMy0wLjE0IDAuMDQtMC4yMSAwLjA0IC0wLjI2IDAtMC40NC0wLjA3LTAuNTYtMC4yMSAtMC4xMS0wLjE0LTAuMTYtMC4zMS0wLjE2LTAuNSAwLTAuMDcgMC0wLjExIDAuMDEtMC4xNGwwLjMxLTIuNDhjMC4wMy0wLjE0IDAuMS0wLjI1IDAuMjEtMC4zNCAwLjExLTAuMDkgMC4yNC0wLjEzIDAuNC0wLjEzaDIuODljMC4xNiAwIDAuMjkgMC4wNSAwLjQgMC4xNiAwLjExIDAuMTEgMC4xNiAwLjI0IDAuMTYgMC40IDAgMC4xNS0wLjA1IDAuMjgtMC4xNiAwLjM5IC0wLjExIDAuMS0wLjI0IDAuMTYtMC40IDAuMTZoLTIuNDhsLTAuMTkgMS40NWMwLjEzLTAuMDcgMC4yOS0wLjEzIDAuNDgtMC4xOCAwLjE5LTAuMDUgMC4zOC0wLjA3IDAuNTUtMC4wN0MyMTUuMSA1NC4zNiAyMTUuNSA1NC40NiAyMTUuODYgNTQuNjd6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIxOS4zMyA1OC43MWMtMC40LTAuMy0wLjcxLTAuNzItMC45MS0xLjI2IC0wLjIxLTAuNTQtMC4zMS0xLjE3LTAuMzEtMS44OHMwLjEtMS4zNCAwLjMxLTEuODhjMC4yMS0wLjU0IDAuNTEtMC45NiAwLjkyLTEuMjYgMC40LTAuMyAwLjg5LTAuNDUgMS40NS0wLjQ1czEuMDQgMC4xNSAxLjQ1IDAuNDVjMC40IDAuMyAwLjcxIDAuNzIgMC45MiAxLjI2IDAuMjEgMC41NCAwLjMxIDEuMTcgMC4zMSAxLjg5cy0wLjEgMS4zNC0wLjMxIDEuODljLTAuMjEgMC41NC0wLjUxIDAuOTctMC45MSAxLjI2IC0wLjQgMC4zLTAuODggMC40NS0xLjQ0IDAuNDVTMjE5LjczIDU5LjAxIDIxOS4zMyA1OC43MXpNMjIxLjc4IDU3LjM1YzAuMjQtMC40MSAwLjM3LTEgMC4zNy0xLjc5cy0wLjEyLTEuMzgtMC4zNi0xLjc5Yy0wLjI0LTAuNDEtMC41OC0wLjYxLTEtMC42MXMtMC43NiAwLjItMSAwLjYxIC0wLjM2IDEtMC4zNiAxLjc5IDAuMTIgMS4zOCAwLjM3IDEuNzkgMC41OCAwLjYxIDEgMC42MVMyMjEuNTQgNTcuNzYgMjIxLjc4IDU3LjM1eiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yMjYuNTYgNTIuMjRjMC4xMSAwLjEyIDAuMTcgMC4yNiAwLjE3IDAuNDR2NS43OGMwIDAuMTctMC4wNiAwLjMyLTAuMTkgMC40NCAtMC4xMyAwLjEyLTAuMjggMC4xOC0wLjQ3IDAuMThzLTAuMzQtMC4wNi0wLjQ2LTAuMTcgLTAuMTgtMC4yNi0wLjE4LTAuNDN2LTQuNzRsLTAuNjIgMC4zOGMtMC4xIDAuMDYtMC4yMSAwLjA5LTAuMzIgMC4wOSAtMC4xNyAwLTAuMzEtMC4wNi0wLjQyLTAuMTkgLTAuMTItMC4xMy0wLjE3LTAuMjctMC4xNy0wLjQyIDAtMC4xMSAwLjAzLTAuMjEgMC4wOS0wLjNzMC4xMy0wLjE3IDAuMjMtMC4yMmwxLjUxLTAuOWMwLjExLTAuMDYgMC4yNi0wLjA5IDAuNDMtMC4wOUMyMjYuMzEgNTIuMDYgMjI2LjQ1IDUyLjEyIDIyNi41NiA1Mi4yNHoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjMyLjM4IDU4LjEyYzAuMTEgMC4xMSAwLjE2IDAuMjQgMC4xNiAwLjQgMCAwLjE1LTAuMDUgMC4yOC0wLjE2IDAuMzkgLTAuMTEgMC4xLTAuMjQgMC4xNi0wLjQgMC4xNmgtMy40Yy0wLjE3IDAtMC4zMS0wLjA1LTAuNDEtMC4xNiAtMC4xLTAuMTEtMC4xNS0wLjI0LTAuMTUtMC40MXMwLjA2LTAuMzEgMC4xOC0wLjQ0bDIuMTgtMi4zM2MwLjI1LTAuMjcgMC40NC0wLjUzIDAuNTktMC44IDAuMTQtMC4yNyAwLjIyLTAuNTIgMC4yMi0wLjc0IDAtMC4zLTAuMTEtMC41Ni0wLjMyLTAuNzggLTAuMjEtMC4yMi0wLjQ2LTAuMzMtMC43NC0wLjMzIC0wLjE5IDAtMC4zOSAwLjA3LTAuNTggMC4yIC0wLjIgMC4xMy0wLjM3IDAuMy0wLjUzIDAuNTIgLTAuMTIgMC4xNi0wLjI3IDAuMjQtMC40NiAwLjI0IC0wLjE1IDAtMC4yOC0wLjA2LTAuNC0wLjE3IC0wLjEyLTAuMTEtMC4xOC0wLjI0LTAuMTgtMC4zOCAwLTAuMSAwLjAzLTAuMiAwLjEtMC4zIDAuMDctMC4xIDAuMTctMC4yMiAwLjMtMC4zNSAwLjI1LTAuMjUgMC41NS0wLjQ2IDAuODgtMC42MXMwLjY1LTAuMjMgMC45Ni0wLjIzYzAuNDQgMCAwLjgzIDAuMDkgMS4xNiAwLjI4IDAuMzMgMC4xOSAwLjU5IDAuNDQgMC43NyAwLjc3IDAuMTggMC4zMyAwLjI3IDAuNyAwLjI3IDEuMTEgMCAwLjQxLTAuMTEgMC44My0wLjMyIDEuMjVzLTAuNTEgMC44NC0wLjg3IDEuMjRsLTEuMjcgMS4zNWgyLjA2QzIzMi4xNSA1Ny45NiAyMzIuMjggNTguMDEgMjMyLjM4IDU4LjEyeiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yNDAuMjUgNTIuMzdjMC4zMSAwLjIgMC41NSAwLjQ4IDAuNzQgMC44MiAwLjE5IDAuMzQgMC4yOCAwLjcyIDAuMjggMS4xMyAwIDAuNC0wLjA5IDAuNzctMC4yOCAxLjEyIC0wLjE5IDAuMzUtMC40MyAwLjYyLTAuNzQgMC44MyAtMC4zMSAwLjItMC42MyAwLjMxLTAuOTcgMC4zMWgtMS43NHYxLjg5YzAgMC4xOC0wLjA1IDAuMzMtMC4xNiAwLjQ0IC0wLjExIDAuMTEtMC4yNSAwLjE3LTAuNDIgMC4xNyAtMC4xNyAwLTAuMy0wLjA2LTAuNDEtMC4xNyAtMC4xMS0wLjEyLTAuMTYtMC4yNi0wLjE2LTAuNDN2LTUuNzhjMC0wLjE3IDAuMDYtMC4zMiAwLjE4LTAuNDMgMC4xMi0wLjEyIDAuMjYtMC4xNyAwLjQ0LTAuMTdoMi4yOEMyMzkuNjIgNTIuMDYgMjM5Ljk1IDUyLjE2IDI0MC4yNSA1Mi4zN3pNMjM5LjY2IDU1LjI2YzAuMTItMC4xMSAwLjIyLTAuMjQgMC4zLTAuNDFzMC4xMi0wLjM1IDAuMTItMC41MyAtMC4wNC0wLjM2LTAuMTEtMC41MyAtMC4xOC0wLjMxLTAuMy0wLjQxYy0wLjEyLTAuMS0wLjI1LTAuMTUtMC4zNy0wLjE1aC0xLjc0djIuMjFoMS43NEMyMzkuNDEgNTUuNDIgMjM5LjU0IDU1LjM3IDIzOS42NiA1NS4yNnoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjQ3LjU2IDU4LjUyYzAgMC4xNy0wLjA2IDAuMzItMC4xNyAwLjQzIC0wLjExIDAuMTEtMC4yNCAwLjE3LTAuMzkgMC4xNyAtMC4xMiAwLTAuMjMtMC4wNC0wLjMyLTAuMTFzLTAuMTctMC4xNy0wLjIyLTAuM2wtMC41Mi0xLjIxaC0yLjk4bC0wLjUyIDEuMjJjLTAuMDUgMC4xMy0wLjEyIDAuMjMtMC4yMSAwLjMgLTAuMSAwLjA3LTAuMiAwLjExLTAuMzEgMC4xMSAtMC4xNyAwLTAuMy0wLjA1LTAuMzktMC4xNCAtMC4wOS0wLjA5LTAuMTMtMC4yMi0wLjEzLTAuMzggMC0wLjA2IDAuMDEtMC4xMiAwLjAzLTAuMTlsMi40OS01Ljk4YzAuMDUtMC4xMyAwLjEzLTAuMjQgMC4yNC0wLjMxIDAuMTEtMC4wNyAwLjIzLTAuMSAwLjM2LTAuMDkgMC4xMiAwIDAuMjMgMC4wNCAwLjM0IDAuMTEgMC4xIDAuMDcgMC4xOCAwLjE3IDAuMjMgMC4zbDIuNDYgNS44NkMyNDcuNTUgNTguMzcgMjQ3LjU2IDU4LjQ1IDI0Ny41NiA1OC41MnpNMjQzLjQ0IDU2LjM0aDJsLTEuMDEtMi4zNEwyNDMuNDQgNTYuMzR6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTI1NC4xMSA1OC4yOWMwLjA1IDAuMDkgMC4wOCAwLjE4IDAuMDggMC4yNyAwIDAuMTItMC4wNCAwLjIzLTAuMTIgMC4zMyAtMC4xIDAuMTItMC4yNSAwLjE4LTAuNDYgMC4xOCAtMC4xNiAwLTAuMzEtMC4wNC0wLjQ0LTAuMTEgLTAuNDgtMC4yNy0wLjcyLTAuODMtMC43Mi0xLjY3IDAtMC4yNC0wLjA4LTAuNDMtMC4yMy0wLjU3IC0wLjE2LTAuMTQtMC4zOC0wLjIxLTAuNjctMC4yMWgtMS44N3YxLjk0YzAgMC4xOC0wLjA1IDAuMzMtMC4xNCAwLjQ0cy0wLjIyIDAuMTctMC4zOCAwLjE3Yy0wLjE5IDAtMC4zNi0wLjA2LTAuNS0wLjE3IC0wLjE0LTAuMTItMC4yMS0wLjI2LTAuMjEtMC40M3YtNS43OGMwLTAuMTcgMC4wNi0wLjMyIDAuMTgtMC40MyAwLjEyLTAuMTIgMC4yNi0wLjE3IDAuNDQtMC4xN2gyLjg4YzAuMzUgMCAwLjY3IDAuMDkgMC45OCAwLjI4IDAuMzEgMC4xOSAwLjU1IDAuNDQgMC43NCAwLjc3IDAuMTggMC4zMyAwLjI4IDAuNjkgMC4yOCAxLjEgMCAwLjMzLTAuMDkgMC42Ni0wLjI3IDAuOTggLTAuMTggMC4zMi0wLjQxIDAuNTctMC43IDAuNzYgMC40MiAwLjI5IDAuNjUgMC42OSAwLjY5IDEuMTggMC4wMiAwLjExIDAuMDMgMC4yMSAwLjAzIDAuMzEgMC4wMyAwLjIxIDAuMDUgMC4zNiAwLjA4IDAuNDUgMC4wMyAwLjA5IDAuMDkgMC4xNiAwLjE4IDAuMjFDMjUzLjk5IDU4LjEzIDI1NC4wNiA1OC4yIDI1NC4xMSA1OC4yOXpNMjUyLjIgNTUuMzFjMC4xMS0wLjExIDAuMjEtMC4yNiAwLjI4LTAuNDVzMC4xMS0wLjM5IDAuMTEtMC42MWMwLTAuMTktMC4wNC0wLjM2LTAuMTEtMC41MXMtMC4xNy0wLjI4LTAuMjgtMC4zNyAtMC4yMy0wLjE0LTAuMzUtMC4xNGgtMi4xOXYyLjI3aDIuMTlDMjUxLjk3IDU1LjQ4IDI1Mi4wOSA1NS40MiAyNTIuMiA1NS4zMXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjU2LjM0IDU4Ljg5Yy0wLjEzIDAuMTItMC4yNyAwLjE4LTAuNDQgMC4xOCAtMC4xOCAwLTAuMzMtMC4wNi0wLjQ0LTAuMTdzLTAuMTctMC4yNi0wLjE3LTAuNDN2LTUuNzhjMC0wLjE3IDAuMDYtMC4zMiAwLjE4LTAuNDMgMC4xMi0wLjEyIDAuMjctMC4xNyAwLjQ2LTAuMTcgMC4xNyAwIDAuMzEgMC4wNiAwLjQzIDAuMTggMC4xMiAwLjEyIDAuMTggMC4yNiAwLjE4IDAuNDR2NS43OEMyNTYuNTMgNTguNjIgMjU2LjQ3IDU4Ljc3IDI1Ni4zNCA1OC44OXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjU5IDU4Ljk4Yy0wLjM3LTAuMTItMC43Mi0wLjMyLTEuMDUtMC42MSAtMC4xOC0wLjE2LTAuMjctMC4zNC0wLjI3LTAuNTMgMC0wLjE1IDAuMDYtMC4yOSAwLjE3LTAuNHMwLjI1LTAuMTcgMC40MS0wLjE3YzAuMTMgMCAwLjI0IDAuMDQgMC4zNCAwLjEyIDAuMjcgMC4yMiAwLjUzIDAuMzggMC43OCAwLjQ4IDAuMjUgMC4xIDAuNTUgMC4xNSAwLjkgMC4xNSAwLjM3IDAgMC43LTAuMDggMC45Ny0wLjI1IDAuMjctMC4xNyAwLjQxLTAuMzcgMC40MS0wLjYyIDAtMC4zLTAuMTMtMC41My0wLjQtMC43IC0wLjI3LTAuMTctMC42OS0wLjMtMS4yNy0wLjM4IC0xLjQ2LTAuMjEtMi4xOS0wLjg5LTIuMTktMi4wNCAwLTAuNDIgMC4xMS0wLjc4IDAuMzMtMS4wOSAwLjIyLTAuMzEgMC41Mi0wLjU1IDAuOS0wLjcxIDAuMzgtMC4xNiAwLjgtMC4yNCAxLjI3LTAuMjQgMC40MiAwIDAuODIgMC4wNiAxLjE5IDAuMTkgMC4zNyAwLjEzIDAuNjggMC4yOSAwLjkzIDAuNSAwLjE5IDAuMTUgMC4yOSAwLjMzIDAuMjkgMC41MyAwIDAuMTUtMC4wNiAwLjI5LTAuMTcgMC40MSAtMC4xMSAwLjEyLTAuMjUgMC4xOC0wLjQgMC4xOCAtMC4xIDAtMC4xOS0wLjAzLTAuMjctMC4wOSAtMC4xNy0wLjE0LTAuNDEtMC4yNy0wLjcyLTAuMzggLTAuMzEtMC4xMi0wLjU5LTAuMTctMC44My0wLjE3IC0wLjQyIDAtMC43NCAwLjA4LTAuOTcgMC4yNHMtMC4zNCAwLjM2LTAuMzQgMC42MmMwIDAuMjkgMC4xMiAwLjUgMC4zNiAwLjY1IDAuMjQgMC4xNSAwLjYxIDAuMjcgMS4xMiAwLjM2IDAuNTcgMC4xIDEuMDMgMC4yMyAxLjM4IDAuMzkgMC4zNCAwLjE2IDAuNiAwLjM3IDAuNzggMC42NHMwLjI2IDAuNjMgMC4yNiAxLjA4YzAgMC40Mi0wLjEyIDAuNzktMC4zNSAxLjExIC0wLjI0IDAuMzItMC41NSAwLjU2LTAuOTQgMC43MyAtMC4zOSAwLjE3LTAuODIgMC4yNi0xLjI3IDAuMjZDMjU5LjggNTkuMTYgMjU5LjM4IDU5LjEgMjU5IDU4Ljk4eiIvPjwvc3ZnPg==") no-repeat;
      background-size: contain;
      background-position: 50% 50%;
      font-size: 0;
      opacity: 0.95;
      transition: 0.1s;
    }

    .logocf:hover {
      opacity: 1;
    }

    .search {
      position: absolute;
      bottom: 0; left: 0;
      width: calc(100% - 48px); height: 48px;
      background-color: #eee;
      display: none;
    }
  </style>
</menubar>