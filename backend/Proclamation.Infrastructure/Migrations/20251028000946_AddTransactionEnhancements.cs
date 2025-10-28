using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Proclamation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTransactionEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Transactions",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "FamilyId",
                table: "Transactions",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_FamilyId",
                table: "Transactions",
                column: "FamilyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Families_FamilyId",
                table: "Transactions",
                column: "FamilyId",
                principalTable: "Families",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Families_FamilyId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_FamilyId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "FamilyId",
                table: "Transactions");
        }
    }
}
