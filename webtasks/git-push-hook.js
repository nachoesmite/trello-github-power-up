
module.exports =
    function (context, req, res) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(require('ejs').render(view.stringify(), {
            name: JSON.stringify(req) || 'Anonymous',
            name2: JSON.stringify(context) || 'Anonymous 2'
        }));
    }

function view() {
  /*
    <html>
    <head>
      <title>Welcome to Webtasks</title>
    </head>
    <body>
      <%= name %>
      <%= name2 %>
    </body>
    </html>
*/
}
