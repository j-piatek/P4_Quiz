//MODELO DE DATOS
const Sequelize = require('sequelize'); //cargar modulo de sequelize

const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging:false}); //url para poder acceder a la base de datos

sequelize.define('quiz', {
    question: {
        type: Sequelize.STRING,
        unique: {msg: "Ya existe esta pregunta"},
        validate: {notEmpty: {msg:"La pregunta no puede estar vacía"}} //no permite que se creen preguntas vacias
    },
    answer: {
        type: Sequelize.STRING,
        validate: {notEmpty: {msg: "La respuesta no puede estar vacía"}}
    }
});

sequelize.sync() //SINCRONIZACION: mirar si en la base de datos estan las tablas que se van a utilizar
.then(() => sequelize.models.quiz.count()) //cuenta cuantos quizzes hay
.then(count => {
    if (!count){ //si no hay preguntas (count = 0) crea varios quizzes
        return sequelize.models.quiz.bulkCreate([
            {question: "Capital de Italia", answer: "Roma"},
            {question: "Capital de Francia", answer: "París"},
            {question: "Capital de España", answer: "Madrid"},
            {question: "Capital de Portugal", answer: "Lisboa"},
        ]);
    }
})
.catch(error => {
    console.log(error);
});

module.exports = sequelize;