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
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			organization_id TEXT
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
			order_index INTEGER,
			organization_id TEXT
		)
	`)
	if err != nil {
		return err
	}
	return nil
}

func createColumnJobLinksTable(dbpool *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := dbpool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS ColumnJobLinks (
			id TEXT PRIMARY KEY,
			column_id TEXT NOT NULL,
			job_id TEXT NOT NULL,
			order_index INTEGER NOT NULL,
			date_updated TIMESTAMPTZ NOT NULL
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
			members TEXT[],
			pending_members TEXT[]
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
			reporter_id TEXT,
			organization_id TEXT,
			assignee_ids TEXT[],
			unit_identifier TEXT,
			building_id TEXT,
			label_ids TEXT[],
			attachments TEXT[],
			cost FLOAT8,
			hours INT,
			rent_paid BOOLEAN,
			due_date TIMESTAMP,
			created_at TIMESTAMP,
			closed_at TIMESTAMP
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
		return fmt.Errorf("Error creating table: %v", err)
	}
	return nil
}

func createInspectionItemsTable(dbpool *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := dbpool.Exec(ctx, `
        CREATE TABLE IF NOT EXISTS inspection_items (
            id TEXT PRIMARY KEY,
            inspection_id TEXT NOT NULL,
            inspection_template_id TEXT NOT NULL,
            organization_id TEXT NOT NULL,  
            checked BOOLEAN,
            checked_at TIMESTAMPTZ,
            comments TEXT
        )
    `)
	if err != nil {
		return err
	}
	return nil
}

func createInspectionTemplateItemsTable(dbpool *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := dbpool.Exec(ctx, `
        CREATE TABLE IF NOT EXISTS inspection_template_items (
            id TEXT PRIMARY KEY,
            order_index INTEGER,
            item TEXT NOT NULL,
            inspection_template_id TEXT NOT NULL,
            organization_id TEXT NOT NULL,  
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `)
	if err != nil {
		return err
	}
	return nil
}

func createInspectionTemplatesTable(dbpool *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := dbpool.Exec(ctx, `
        CREATE TABLE IF NOT EXISTS inspection_templates (
            id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
            organization_id TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `)
	if err != nil {
		return err
	}
	return nil
}

func createInspectionsTable(dbpool *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := dbpool.Exec(ctx, `
        CREATE TABLE IF NOT EXISTS inspections (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            schedule_date TIMESTAMPTZ NOT NULL,
            assignee_ids TEXT[],
            organization_id TEXT NOT NULL
        )
    `)
	if err != nil {
		return err
	}
	return nil
}

func createPendingMembersTable(dbpool *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := dbpool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS pending_members (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL,
			organization_id TEXT NOT NULL,
			role_id TEXT
		)
	`)
	if err != nil {
		return fmt.Errorf("Error creating pending_members table: %v", err)
	}
	return nil
}

func main() {
	// neon.tech
	connStr := "user=exolutiontech password=***REMOVED-DB-PASSWORD*** dbname=neondb host=ep-autumn-math-44120355.us-east-2.aws.neon.tech sslmode=verify-full"
	dbpool, err := pgxpool.Connect(context.Background(), connStr)
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

	err = createColumnJobLinksTable(dbpool)
	if err != nil {
		log.Fatal("Error creating labels table: ", err)
	}

	// Create the InspectionItems table
	err = createInspectionItemsTable(dbpool)
	if err != nil {
		log.Fatal("Error creating inspection_items table: ", err)
	}

	// Create the InspectionTemplateItems table
	err = createInspectionTemplateItemsTable(dbpool)
	if err != nil {
		log.Fatal("Error creating inspection_template_items table: ", err)
	}

	// Create the InspectionTemplates table
	err = createInspectionTemplatesTable(dbpool)
	if err != nil {
		log.Fatal("Error creating inspection_templates table: ", err)
	}

	// Create the Inspections table
	err = createInspectionsTable(dbpool)
	if err != nil {
		log.Fatal("Error creating inspections table: ", err)
	}

	err = createPendingMembersTable(dbpool)
	if err != nil {
		log.Fatal("Error creating pending members table: ", err)
	}

	// Call other create table functions here
	// ALTER TABLE ColumnJobLinks ADD CONSTRAINT unique_job_column UNIQUE(job_id, column_id);
}
