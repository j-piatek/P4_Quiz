const figlet = require('figlet'); //Require de los paquetes que necesito
const chalk = require('chalk');


/**
 * Dar color a un string
 * @param msg String que queremos colorear
 * @param color
 * @returns {*} Devuelve el String msg con color indicado
 */
const colorize = (msg, color) => {

    if (typeof color !== "undefined"){
        msg = chalk[color].bold(msg);
    }
    return msg;
};

/**
 * Escribe un mensaje de log
 * @param msg setring a escribir
 * @param color
 */
const log = (socket, msg,color) => {
    socket.write(colorize(msg,color) + "\n"); // \n para meter el retorno de carro
};

/**
 * Escribe un mensaje en log grande (letras grandes)
 * @param msg
 * @param color
 */
const biglog = (socket, msg,color) => {
    log(socket, figlet.textSync(msg, {horizontalLayout: 'full'}), color);
};

/**
 * Escribe el mensaje de error
 * @param emsg Texto del mensaje de error
 */
const errorlog = (socket, emsg) => {
    socket.write(`${colorize("Error", "red")}: ${colorize(colorize(emsg, "red"), "bgYellowBright")} \n`);
};

exports = module.exports = { //Exportamos funciones
    colorize,
    log,
    biglog,
    errorlog
};
