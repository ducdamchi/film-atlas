module.exports = (sequelize, DataTypes) => {
  const Films = sequelize.define("Films", {
    //use TMDB id as model's id
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    runtime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    director: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    poster_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    backdrop_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    origin_country: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    release_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  })

  // Each User can have many "Like" instances
  Films.associate = (models) => {
    Films.belongsToMany(models.Users, {
      through: models.Likes,
      foreignKey: "filmId",
      otherKey: "userId",
    })
  }

  // Users.associate = (models) => {
  //   Users.belongsToMany(models.Films, {
  //     through: models.UserLikedFilms,
  //     foreignKey: "userId",
  //     otherKey: "filmId",
  //   })
  // }
  return Films
}
