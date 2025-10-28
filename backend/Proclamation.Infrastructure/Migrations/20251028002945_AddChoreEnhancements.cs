using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Proclamation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddChoreEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ClaimedAt",
                table: "Chores",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompletionNotes",
                table: "Chores",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClaimedAt",
                table: "Chores");

            migrationBuilder.DropColumn(
                name: "CompletionNotes",
                table: "Chores");
        }
    }
}
