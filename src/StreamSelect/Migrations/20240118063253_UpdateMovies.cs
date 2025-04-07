using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StreamSelect.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMovies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Genre",
                table: "Movies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<float>(
                name: "Rating",
                table: "Movies",
                type: "real",
                nullable: false,
                defaultValue: 0f);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Genre",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Movies");
        }
    }
}
