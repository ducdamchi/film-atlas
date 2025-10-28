module.exports = (sequelize, DataTypes) => {
  const Directors = sequelize.define("Directors", {
    id: {
      //director's TMDB id
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profile_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  })

  Directors.associate = (models) => {
    // Each Director can be liked by many Users
    Directors.belongsToMany(models.Users, {
      through: models.WatchedDirectors,
      as: "watchedDirectors",
      foreignKey: "directorId",
      otherKey: "userId",
    })
  }
  return Directors
}
