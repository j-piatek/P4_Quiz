const Sequelize = require('sequelize');

const {log, biglog, errorlog, colorize} = require("./out"); //Importamos funcione desde out.js

const {models} = require('./model'); //Importamos model.js para poder usar las funciones alli declaradas

const quizzes = require('./model');

/**
 * Muestra la ayuda
 */
exports.helpCmd = (socket, rl) => {
    log(socket, "Comandos:");
    log(socket, " h|help - Muestra esta ayuda.");
    log(socket, " list - Listar los quizzies existentes.");
    log(socket, " show <id> - Muestra la pregunta y la respueste del quiz indicado.");
    log(socket," add - Añadir un nuevo quiz interactivamente.");
    log(socket," delete <id> - Borrar el quiz indicado.");
    log(socket, " edit <id> - Editar el quiz indicado.");
    log(socket, " test <id> - Probar el quiz indicado.");
    log(socket, " p|play - Jugar a preguntar aleatoriamente todos los quizzies.");
    log(socket, " credits - Créditos.");
    log(socket, " q|quit - Salir del programa.");
    rl.prompt();
};


exports.listCmd = (socket, rl) => {

   models.quiz.findAll() //promesa que cuando se cumple devuelve los quizzes existentes
       .each(quiz => { //toma cada elemento del array que se pasa. Tambien se podria hacer con bucle for
               log(socket, ` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
       })
       .catch(error => {
           errorlog(socket, error.message);
       })
       .then(() => { //then final, pase lo que pase saca el prompt
           rl.prompt();
       });
};

/**
 * Funcion que devuelve una promesa que valida si se ha pasado
 * un parametro y convierte este en un numero entero. Devuelve
 * el valor id a usar
 *
 * Se usa en showCmd()
 */
const validateId = id => {
    return new Sequelize.Promise ((resolve, reject) => {
        if (typeof id === "undefined"){
            reject(new Error (`Falta el parametro <id>. `));
        } else {
            id = parseInt(id); //coge parte entera
            if (Number.isNaN(id)) {
                reject(new Error (`El valor del parámetro <id> no es un número`));
            }else{
                resolve(id);
            }
        }
    });
};



exports.showCmd = (socket, rl,id) => {
    validateId(id) //si se cumple la promesa pasa a hacer lo que está en el then
        .then(id => models.quiz.findById(id)) //busco quiz por su id
        .then(quiz => {
            if (!quiz){
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
            log(socket, `[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        })
        .catch(error => { //si se produce error en alguna de las promesas anteriores se captura aquí
            errorlog(socket, error.message);
        })
        .then(() => {
            rl.prompt();
        });
};


/**
 * Funcion que convierte la llamada rl.question (callback) en una funcion basada en promesas
 * Devuelve una promesa que cuando se cumple proporciona el texto intoducido
 *
 * En vez de utilizar rl.question utilizaremos makeQuestion que lo hace en plan promesa
 * @param rl
 * @param text
 * @returns {Promise<any>}
 */
const makeQuestion = (rl, text) => {
    return new Sequelize.Promise((resolve,reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim());
        });
    });
};

exports.addCmd = (socket, rl) => {
    makeQuestion(rl, 'Introduzca una pregunta: ')
        .then(q => {
            return makeQuestion(rl, 'Introduzca la respuesta')
            .then (a => {
                return {question: q, answer: a}; //construyo un objeto de tipo quiz
            });
        })
        .then(quiz => {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            log(socket, ` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => { //captura error de validacion
            errorlog(socket, 'El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(socket, error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

exports.deleteCmd = (socket, rl, id) => {
   validateId(id)
   .then(id => models.quiz.destroy({where: {id}}))//models accede a la base de datos, al modelo quiz y destroy el elemento con id pasado
   .catch(error => {
       errorlog(socket, error.message);
   })
   .then(() => {    //sitodo va bien vuelve a sacar el prompt
       rl.prompt();
   });
};

/**
 * Edita un quiz cambiando la pregunta y la respuesta
 * @param rl
 * @param id
 */
exports.editCmd = (socket, rl,id) => {
    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if (!quiz){
            throw new Error(`No existe un quiz asociado al id = ${id}.`);
        }

        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
        return makeQuestion(rl, 'Introduzca la pregunta: ')
        .then(q => {
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
            return makeQuestion(rl, 'Introduzca la respuesta')
            .then(a => {
                quiz.question = q;
                quiz.answer = a;
                return quiz;
            });
        });
    })
    .then(quiz => {
        return quiz.save();
    })
    .then(quiz => {
        log(socket, ` Se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
    })
    .catch(Sequelize.ValidationError, error => { //en error pasa un array con todos los errores de validacion
        errorlog(socket, 'El quiz es erroneo:');
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorlog(socket, error.message);
    })
    .then(() => {
        rl.prompt()
    });
};

/**(a completar por el alumno)
 * Hace una pregunta para saber si el usuario sabe la respuesta
 * @param rl
 * @param id
 *
 * Esqueleto de la funcion
 * resp => {
 *  resp === quiz.answer
 *  CORRECTO
 *  INCORRECTO
 *  prompt
 */
exports.testCmd = (socket, rl, id) => {
    validateId(id)

        .then(id => models.quiz.findById(id)) //busco quiz por su id
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id ${id}. `);
            }
            return makeQuestion(rl, ` ${quiz.question} : `)
            .then(answer => {
                    if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
                        log(socket, "CORRECTO", 'green');
                    }else{
                        log(socket, "INCORRECTO", 'red');
                    }
            })
        })




        .catch(Sequelize.ValidationError, error => { //en error pasa un array con todos los errores de validacion
            //errorlog('El quiz es erroneo: ');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(socket, error.message);
        })
        .then(() => { //por qué no vuelve el prompt???
            rl.prompt()
        });
}




exports.playCmd = (socket, rl) => {
    let score = 0;
    var indices = [];

    const playOne = () => {
        return Sequelize.Promise.resolve()
            .then(() => {
                if (indices.length === 0) {
                    log(socket, ` No hay más preguntas.`, 'red');
                    log(socket, ` Fin del examen. Has conseguido ${score} aciertos.`);
                    return;
                } else {
                    let idr = Math.floor(Math.random() * indices.length);
                    let id = indices[idr];
                    indices.splice(idr,1);

                    return makeQuestion(rl, `${id.question} : `)
                        .then(resp => {
                            respuesta = resp.toLowerCase().trim();
                            if (respuesta === id.answer.toLowerCase().trim()) {
                                score++;
                                //console.log("Su respuesta es");
                                log(socket, 'Su respuesta es CORRECTA', 'green');
                                socket.write(`Llevas ${score} aciertos.`);
                                return playOne();
                            } else {
                                socket.write("Su respuesta es:");
                                log(socket,'Su respuesta es: INCORRECTA', 'red');
                                socket.write(`Fin del examen. Has conseguido: ${score} puntos`);
                                return;
                            }
                        })
                }
            })
    };

            models.quiz.findAll()
            .then(quiz => {
                indices = quiz;
            })

            .then(() => {
                return playOne();
            })
            .catch(error => {
                errorlog(error.message);
            })
            .then(() => {
                rl.prompt();
            });


};

exports.creditsCmd = (socket,rl) => {
    log(socket, 'Autores de la práctica:');
    log(socket, 'Jakub Piatek', 'green');
    rl.prompt();
};

exports.quitCmd = (socket, rl) => {
    rl.close();
    socket.end();
};










