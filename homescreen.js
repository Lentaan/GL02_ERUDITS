#!/usr/bin/env node

import User from "./User.js"
import pkg from "@caporal/core"
const { program } = pkg;
import inquirer from "inquirer";
import CruParser from "./CruParser.js";
import fs from "fs";
import CruBuilder from "./CruBuilder.js";

let user = new User("bubulle");
const NB_OPTIONS = [1, 2, 4, 5, 6, 7, 8];
let cruParser = new CruParser();
const DATA_DIR_NAME = 'SujetA_data';

if (user.isConnected() && user.hasPermission()){
    program
        .version('1.0.0')
        .help("1) Changer le contenu du dossier SujetA_data, par votre propre jeu de données" +
            "2) Lancer la commande npm ./homescreen start " +
            "3) Choisissez les actions que vous voulez exécuter")
        .command('start', 'Start the programme')
        .action(startProgram)
        .command('test', "Test votre jeu de données au format CRU")
        .argument('<directoryName>', "Nom du dossier à tester")
        .action(({args }) => {
            parseDataDir(args.directoryName);
            //logger.info("--------------------------CLASSROOMS : -----------------------------");
            //logger.info(JSON.stringify(Array.from(parser.classrooms).sort(), null, 2));
            //logger.info("----------------------------- UES : --------------------------------");
            //logger.info(JSON.stringify(parser.ues.map(value => value.name), null, 2));
            //logger.info(JSON.stringify(parser.schedule.ues, null, 2));
            //logger.info(JSON.stringify(parser.schedule.getSchedule(), null, 2))
            cruParser.schedule.createVisualisation()
        })


    program.run();
}

function startProgram({logger}) {
    parseDataDir(DATA_DIR_NAME);
    logger.info("ORUS - OrgaRoomUniSealand");
    logger.info("Bonjour, que voulez vous faire aujourd'hui ?\n" +
        "1) Voir votre emploi du temps\n" +
        "2) Voir la liste des salles\n" +
        "4) Chercher les salles libre pour un créneau\n" +
        "5) Taux d'occupation des salles\n" +
        "6) Classer les salles par capacité d'accueil\n" +
        "7) Exporter l'emploi du temps au format cru\n" +
        "8) Générer l'emploi du temps pour l'agenda")
    inquirer
        .prompt([{name: "action", type: "number", message: "Entrez le chiffre de l'action choisie : "}])
        .then((answers) => switchActions(logger, answers))
        .catch((error) => {
            logger.error(error.message)
        });
}

function parseDataDir(dir) {
    /* if (checkParseDir(dir)){
         cruParser = JSON.parse(fs.readFileSync(dir+'/data.json', 'utf8'));
     } else {*/
    cruParser.parseDirectory(dir);
    fs.writeFileSync(dir+'/data.json', JSON.stringify(cruParser, null, 2));
    //}
}

function checkParseDir(dir){
    return fs.existsSync(dir+'/data.json');
}

function switchActions(logger, answers) {
    if (Number.isInteger(answers.action) && NB_OPTIONS.find(v => answers.action === v)){
        logger.info("Vous avez choisi l'option : "+answers.action)
    }
    switch (answers.action) {
        case 1:
            visualiseSchedule(logger);
            break;
        case 2:
            break;
        case 4:
            searchFreeClassroom(logger);
            break;
        case 5:
            occupationRates(logger)
            break;
        case 6:
            sortClassroomByHeadcount(logger)
            break;
        case 7:
            exportCru(logger)
            break;
        case 8:
            generateICalendar(logger);
            break;
    }
}

function exportCru(logger) {
    inquirer
        .prompt([
            {message: "Entrez vos UEs séparer par une virgule : ", type: "string", name: "courses"},
        ], () => {})
        .then((answers) => {
            let tokenUes = answers.courses.split(/ , |, | ,|,/);
            let cruBuilder = new CruBuilder();
            cruBuilder.build(cruParser, tokenUes);
            logger.info("Vos UEs ont bien été exporté au format CRU (schedule.cru) à la racine de l'application")
        })
}

function generateICalendar(logger) {
    inquirer
        .prompt([
            {message: "Entrez une date de début (format: yyyy-mm-dd)",
                type:"string", name: "start"},
            {message: "Entrez une date de fin (format: yyyy-mm-dd)",
                type:"string", name: "end"},
        ])
        .then((answers) => {
            if (!isNaN(new Date(answers.start))  && !isNaN(new Date(answers.end))){
                cruParser.schedule.createVisualisation([], answers.start, answers.end);
                logger.info("Un fichier calendar.ics a été créé à la racine de l'application contenant l'emploi du temps complet des salles")
            } else {
                logger.error("Vous n'avez pas rentré le bon format de données (yyyy-mm-dd)")
            }

        })
}

function sortClassroomByHeadcount(logger) {
    logger.info("Voici les salles classer par nombre d'effectif : ");
    let classrooms = cruParser.schedule.sortClassroomByHeadcount();
    for (let classroom of classrooms){
        logger.info(classroom[0] + " : " + classroom[1]);
    }
}

function occupationRates(logger) {
    logger.info("Voici la liste des classes : ");
    logger.info(Array.from(cruParser.schedule.classrooms).sort())
    inquirer
        .prompt([
            {message: "Entrez les identifiant des classes séparés par des virgules pour voir leur taux d'occupation",
                type:"string", name: "classrooms"},
        ])
        .then((answers) => {
            let classrooms = answers.classrooms.split(/ , |, | ,|,/);
            for (let classroom of classrooms) {
                if (!cruParser.schedule.classrooms.has(classroom)){
                    logger.error(classroom + " n'est pas une salle existant dans les données.");
                }
            }
            classrooms = new Set(classrooms);
            logger.info('Les taux d\'occupation de ces salles sont : ')
            let schedule = cruParser.schedule.getOccupationRates(classrooms);
            for (let classroom in schedule){
                logger.info(classroom + " : " + schedule[classroom] + "% des heures possibles");
            }
        });
}

function searchFreeClassroom(logger) {
    const format = /[0-9][0-9]:[0-9][0-9]/
    inquirer
        .prompt([
            {message: "Entrez l'heure de début : (format : hh:mm)", type:"string", name: "start"},
            {message: "Entrez l'heure de fin : (format : hh:mm)", type:"string", name: "end"},
        ])
        .then((answers) => {
            let dates = [];
            for (let date in answers) {
                if (format.test(answers[date])){
                    let parseDate = answers[date].split(':').map(v => Number(v));
                    dates.push((new Date()).setHours(...parseDate));
                } else {
                    logger.warn("Erreur de format pour le créneau, veuillez relancer l'application");
                    process.exit(200);
                }
            }
            cruParser.schedule.displayConsoleFreeClassroom(logger, dates);
        })
}

function visualiseSchedule(logger) {
    const type = [1, 2]
    inquirer
        .prompt([
            {message: "Entrez vos matières séparer par une virgule : ", type: "string", name: "courses"},
            {message: "Voir les informations en brute ou en format ics ? (1 ou 2) : ", type: "number", name: "type"}
        ], () => {})
        .then((answers) => {
            let tokenUes = answers.courses.split(/ , |, | ,|,/);
            if (type.includes(answers.type)){
                switch (answers.type) {
                    case 1:
                        cruParser.schedule.displayConsole(logger, tokenUes)
                        break;
                    case 2:
                        cruParser.schedule.createVisualisation(tokenUes);
                        logger.info("Un fichier .ics a été créé à la racine de l'application contenant votre emploi du temps.")
                        break;
                }


            }
        })

}


