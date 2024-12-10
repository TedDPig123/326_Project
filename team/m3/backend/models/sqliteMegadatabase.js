import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite",
});

const megaDatabase = sequelize.define("MegaDatabase", {
    userId: { //stored regularly
        type: DataTypes.UUID,
        primaryKey: true,
    },
    gridData: { //stores object {gridWidth:..., gridHeight:...}
        type: DataTypes.JSONB,
        allowNull: false,
    },
    gridStateData: { //stores array [{array, id}]
        type: DataTypes.JSONB,
        allowNull: false,
    },
    tileData: { //stores array [{IDBtileID:... type:... details:... imgData}]
        type: DataTypes.JSONB,
        allowNull: false,
    },
    tokenData: { //stores array of tokens [{tokenid, name, description, column, row, top, left, img, mime}]
        type: DataTypes.JSONB,
        allowNull: false,
    },
});

await sequelize.sync();
export default megaDatabase;