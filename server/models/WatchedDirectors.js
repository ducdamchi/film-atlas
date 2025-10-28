module.exports = (sequelize, DataTypes) => {
  const WatchedDirectors = sequelize.define("WatchedDirectors", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    directorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    num_watched_films: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    num_stars_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  })
  return WatchedDirectors
}
