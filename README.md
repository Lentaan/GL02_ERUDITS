# GL02_ERUDITS
Projet GL02

## Comment lancer le projet ?
1. Cloner le projet dans un dossier avec GIT.

    
    $> git clone git@github.com:DaClaudy/GL02_ERUDITS.git <directoryname>
    $> cd <directoryname>


2. Avoir node d'installé sur sa machine.
3. Installer les dépendences.


    $> npm install


4. Vérifier qu'un jeu de données CRU dans un dossier est disponible sur la machine.
5. Tester le jeu de données avec la commande :


    $> node homescreen.js test <chemin_du_dossier_du_jeu_de_données> 


6. Plusieurs objets s'affiche à l'écran, sauf si vos données contiennent des erreurs,
dans ce cas, des messages d'erreur vous montre où se trouve le problème dans votre fichier.