using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Proclamation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFamilyManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AllowChildrenToCreateChores",
                table: "Families",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Families",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "DefaultAllowance",
                table: "Families",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "InviteCode",
                table: "Families",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "InviteCodeExpiresAt",
                table: "Families",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Chores_FamilyId",
                table: "Chores",
                column: "FamilyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Chores_Families_FamilyId",
                table: "Chores",
                column: "FamilyId",
                principalTable: "Families",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Chores_Families_FamilyId",
                table: "Chores");

            migrationBuilder.DropIndex(
                name: "IX_Chores_FamilyId",
                table: "Chores");

            migrationBuilder.DropColumn(
                name: "AllowChildrenToCreateChores",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "DefaultAllowance",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "InviteCode",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "InviteCodeExpiresAt",
                table: "Families");
        }
    }
}
