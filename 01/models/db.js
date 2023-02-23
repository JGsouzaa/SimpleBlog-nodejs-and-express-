const Sequelize = require("sequelize");

    //Conection with db
    const sequelize = new Sequelize("postapp", "root", "Inicial12#$", {
        host: "localhost",
        dialect:"mysql",
        query: {raw:true}
    })

    let db = {};

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
    
    module.exports = db;