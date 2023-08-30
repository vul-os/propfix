package main

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v4/pgxpool"
)

func createRolesTable(dbpool *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := dbpool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS roles (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			description TEXT,
			user_ids TEXT[],
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return err
	}
	return nil
}

func createBuildingsTable(dbpool *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := dbpool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS buildings (
			id TEXT PRIMARY KEY,
			building_name TEXT NOT NULL,
			address TEXT,
			unit_number_system TEXT,
			latitude FLOAT8,
			longitude FLOAT8,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			organization_id TEXT
		)
	`)
	if err != nil {
		return err
	}
	return nil
}

func createColumnsTable(dbpool *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := dbpool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS columns (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			job_ids TEXT[],
			organization_id TEXT
		)
	`)
	if err != nil {
		return err
	}
	return nil
}

func createEventsTable(dbpool *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := dbpool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS events (
			id TEXT PRIMARY KEY,
			type TEXT NOT NULL,
			job_id TEXT,
			member_id TEXT,
			visibility TEXT,
			data JSON,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return err
	}
	return nil
}

func createOrganizationsTable(dbpool *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := dbpool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS organizations (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			members TEXT[]
		)
	`)
	if err != nil {
		return err
	}
	return nil
}

func createPermissionsTable(dbpool *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := dbpool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS permissions (
			id TEXT PRIMARY KEY,
			resource TEXT NOT NULL,
			permission TEXT NOT NULL,
			identifier TEXT NOT NULL,
			created_at TIMESTAMP
		)
	`)
	if err != nil {
		return err
	}
	return nil
}

func createJobsTable(dbpool *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := dbpool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS jobs (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			priority TEXT,
			description TEXT,
			tenant_identifier TEXT,
			organization_id TEXT,
			assignee_ids TEXT[],
			unit_identifier TEXT,
			building_id TEXT,
			labels TEXT[],
			attachments TEXT[],
			cost FLOAT8,
			hours INT,
			due_date TIMESTAMP,
			created_at TIMESTAMP
		)
	`)
	if err != nil {
		return err
	}
	return nil
}

func createLabelsTable(dbpool *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := dbpool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS labels (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			color TEXT,
			organization_id TEXT NOT NULL
		)
	`)
	if err != nil {
		return err
	}
	return nil
}

func main() {
	pgHost := "postgresql-141986-0.cloudclusters.net"
	pgPort := "18850"
	pgDatabase := "propfix"
	pgUser := "propfixadmin"
	pgPassword := "happy123"

	pgConnString := fmt.Sprintf("user=%s password=%s host=%s port=%s dbname=%s sslmode=disable",
		pgUser, pgPassword, pgHost, pgPort, pgDatabase)

	dbpool, err := pgxpool.Connect(context.Background(), pgConnString)
	if err != nil {
		log.Fatal("Error connecting to the database: ", err)
	}
	defer dbpool.Close()

	err = createOrganizationsTable(dbpool)
	if err != nil {
		log.Fatal("Error creating organizations table: ", err)
	}

	err = createRolesTable(dbpool)
	if err != nil {
		log.Fatal("Error creating roles table: ", err)
	}

	err = createBuildingsTable(dbpool)
	if err != nil {
		log.Fatal("Error creating buildings table: ", err)
	}

	err = createColumnsTable(dbpool)
	if err != nil {
		log.Fatal("Error creating columns table: ", err)
	}

	err = createEventsTable(dbpool)
	if err != nil {
		log.Fatal("Error creating events table: ", err)
	}

	err = createPermissionsTable(dbpool)
	if err != nil {
		log.Fatal("Error creating permissions table: ", err)
	}

	err = createJobsTable(dbpool)
	if err != nil {
		log.Fatal("Error creating jobs table: ", err)
	}

	err = createLabelsTable(dbpool)
	if err != nil {
		log.Fatal("Error creating labels table: ", err)
	}

	// Call other create table functions here
}
