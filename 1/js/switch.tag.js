<switch>
  <svg class={ state } onclick={ toggleState } x="0" y="0" viewBox="0 0 400 200">
    <path class="background" d="M399.5 183.36c0 9.47-7.67 17.14-17.14 17.14H16.64c-9.47 0-17.14-7.67-17.14-17.14V17.64C-0.5 8.18 7.18 0.5 16.64 0.5h365.72c9.47 0 17.14 7.68 17.14 17.14V183.36z"/>
    <g>
      <path class="button" d="M199.5 183.36c0 9.47-7.67 17.14-17.14 17.14H16.64c-9.47 0-17.14-7.67-17.14-17.14V17.64C-0.5 8.18 7.18 0.5 16.64 0.5h165.71c9.47 0 17.14 7.68 17.14 17.14V183.36z"/>
      <rect class="off" x="52" y="53" width="95" height="95"/>
      <circle class="on" fill="#0c0" cx="99.9" cy="100.53" r="53.9"/>
    </g>
  </svg>

  <script>
    var tag = this;

    tag.state = (opts.state === "on" ? "on" : "off"); // Default state off
    tag.toggleState = toggleState;
    // tag.on("mount", onMount);
    // tag.on("update", onUpdate);
    // function onMount () {}
    // function onUpdate () {}

    function toggleState () {
      tag.state = (tag.state === "on" ? "off" : "on");
    }
  </script>

  <style>
    switch > svg  { height: 28px; margin: 4px;  cursor: pointer; }
    switch .background { fill: #333; }
    switch .button { fill: #666; }
    switch .on { fill: #2c2; }
    switch .off { fill: #f30; }
    switch g { transition: 0.1s; }
    switch > svg.on g { transform: translateX(50%); }
    switch > svg.on .off, switch > svg.off .on { display: none; }
  </style>
</switch>