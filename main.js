
const readline = require('readline');

const model = require('./model'); //Importamos model.js para poder usar las funciones alli declaradas

const {log, biglog, errorlog,colorize} = require("./out"); //Importamos funcione desde out.js

const cmds = require("./cmds");//Importar comandos

const net = require("net"); //requerimos el modulo net

net.createServer(socket => { //definicion del servidor y lo que se ejecuta cada vez que se conecta un cliente

    console.log("Se ha conectado un cliente desde " + socket.remoteAddress); //mensaje que indica que se conecta nuevo cliente

    //Mensaje inicial
    biglog(socket, 'CORE Quiz', 'green');

    const rl = readline.createInterface({
        input: socket,
        output: socket,
        prompt: colorize("quiz> ", 'blue'),
        completer: (line) => {
            const completions = 'h help add delete edit list test p play credits q quit'.split(' ');
            const hits = completions.filter((c) => c.startsWith(line));
            // show all completions if none found
            return [hits.length ? hits : completions, line];
        }
    });

    socket
    .on("end" , () => {rl.close();})
    .on("error" , () => {rl.close();});

    rl.prompt();

    rl.on('line', (line) => {

        let args = line.split(" ");
        let cmd = args[0].toLowerCase().trim(); //Lo pongo en mayusculas (minusculas) y le quito los blancos

        switch (cmd) {
            case '':
                rl.prompt();
                break;
            case 'h':
            case 'help':
                cmds.helpCmd(socket, rl); //Llamada a funcion
                break;

            case 'quit':
            case 'q':
                cmds.quitCmd(socket, rl);
                break;
            case 'add':
                cmds.addCmd(socket, rl);
                break;
            case 'list':
                cmds.listCmd(socket, rl);
                break;
            case 'show':
                cmds.showCmd(socket, rl,args[1]);
                break;
            case 'test':
                cmds.testCmd(socket, rl,args[1]);
                break;
            case 'play':
            case'p':
                cmds.playCmd(socket, rl);
                break;
            case 'delete':
                cmds.deleteCmd(socket, rl,args[1]);
                break;
            case 'edit':
                cmds.editCmd(socket, rl,args[1]);
                break;
            case 'credits':
                cmds.creditsCmd(socket, rl);
                break;
            default:
                log(socket, `Comando desconocido: '${colorize(cmd, 'red')}'`);
                //log('Use ${colorize(help, green)} para ver todos los comandos disponibles.');
                log(socket, `Use ${colorize('help', 'green')} para ver todos los comandos disponibles.`);
                rl.prompt();
                break;
        }

    })
        .on('close', () => {
            log(socket, 'Adios!');
            //process.exit(0); -- en este caso no queremos matar al servidor
        });


})
.listen(3030);

