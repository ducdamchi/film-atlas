module.exports = (sequelize, DataTypes) => {
  const Likes = sequelize.define("Likes", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    filmId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[0, 1, 2, 3]],
      },
    },
  })

  Likes.associate = (models) => {
    Likes.belongsToMany(models.WatchedDirectors, {
      through: models.WatchedDirectorLikes,
      as: "watchedDirectorLikes",
      foreignKey: "likeId",
      otherKey: "watchedDirectorId",
    })
  }

  return Likes
}
