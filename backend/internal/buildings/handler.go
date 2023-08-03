package buildings

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"cloud.google.com/go/bigquery"
	"google.golang.org/api/iterator"
)

type BuildingsHandler struct {
	client *bigquery.Client
}

func NewBuildingsHandler(client *bigquery.Client) *BuildingsHandler {
	return &BuildingsHandler{
		client: client,
	}
}

type Building struct {
	ID               string    `bigquery:"id" json:"id"`
	BuildingName     string    `bigquery:"buildingName" json:"buildingName"`
	Address          string    `bigquery:"address" json:"address"`
	UnitNumberSystem string    `bigquery:"unitNumberSystem" json:"unitNumberSystem"`
	CreatedAt        time.Time `bigquery:"createdAt" json:"createdAt"`
}

func (h *BuildingsHandler) CreateBuilding(w http.ResponseWriter, r *http.Request) {
	var building Building
	err := json.NewDecoder(r.Body).Decode(&building)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	inserter := h.client.Dataset("main").Table("Buildings").Inserter()
	err = inserter.Put(ctx, &building)
	if err != nil {
		http.Error(w, "Failed to create building", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *BuildingsHandler) GetBuilding(w http.ResponseWriter, r *http.Request) {
	var buildingID string
	if id, ok := r.URL.Query()["id"]; ok && len(id) > 0 {
		buildingID = id[0]
	} else {
		http.Error(w, "Building ID is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, buildingName, address, unitNumberSystem, createdAt
		FROM main.Buildings
		WHERE id = @buildingID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "buildingID", Value: buildingID}}

	it, err := q.Read(ctx)
	if err != nil {
		http.Error(w, "Building not found", http.StatusNotFound)
		return
	}

	var building Building
	err = it.Next(&building)
	if err == iterator.Done {
		http.Error(w, "Building not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to read building data", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(building)
}

func (h *BuildingsHandler) UpdateBuilding(w http.ResponseWriter, r *http.Request) {
	var building Building
	err := json.NewDecoder(r.Body).Decode(&building)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Perform basic validation on the building data before update
	if building.BuildingName == "" || building.Address == "" || building.UnitNumberSystem == "" {
		http.Error(w, "BuildingName, Address, and UnitNumberSystem are required fields", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.Buildings
		SET buildingName = @buildingName, address = @address, unitNumberSystem = @unitNumberSystem, createdAt = @createdAt
		WHERE id = @buildingID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "buildingID", Value: building.ID},
		{Name: "buildingName", Value: building.BuildingName},
		{Name: "address", Value: building.Address},
		{Name: "unitNumberSystem", Value: building.UnitNumberSystem},
		{Name: "createdAt", Value: building.CreatedAt},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update building", http.StatusInternalServerError)
		return
	}
}

func (h *BuildingsHandler) DeleteBuilding(w http.ResponseWriter, r *http.Request) {
	var buildingID string
	if id, ok := r.URL.Query()["id"]; ok && len(id) > 0 {
		buildingID = id[0]
	} else {
		http.Error(w, "Building ID is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		DELETE FROM main.Buildings
		WHERE id = @buildingID
	`))
	q.Parameters = []bigquery.QueryParameter{{Name: "buildingID", Value: buildingID}}

	_, err := q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to delete building", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
