
module.exports =
    function (context, req, res) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(require('ejs').render(view.stringify(), {
            name: context.data.name || 'Anonymous'
        }));
    }

function view() {
  
}
