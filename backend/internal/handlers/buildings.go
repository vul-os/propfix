// handlers/buildings.go

package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/gorilla/mux"
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
	ID               string    `json:"id"`
	BuildingName     string    `json:"buildingname"`
	Address          string    `json:"address"`
	UnitNumberSystem string    `json:"unitnumbersystem"`
	CreatedAt        time.Time `json:"createdAt"`
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
	vars := mux.Vars(r)
	buildingID := vars["id"]

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		SELECT id, buildingname, address, unitnumbersystem, createdAt
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
	vars := mux.Vars(r)
	buildingID := vars["id"]

	var building Building
	err := json.NewDecoder(r.Body).Decode(&building)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	q := h.client.Query(fmt.Sprintf(`
		UPDATE main.Buildings
		SET buildingname = @buildingname, address = @address, unitnumbersystem = @unitnumbersystem, createdAt = @createdAt
		WHERE id = @buildingID
	`))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "buildingID", Value: buildingID},
		{Name: "buildingname", Value: building.BuildingName},
		{Name: "address", Value: building.Address},
		{Name: "unitnumbersystem", Value: building.UnitNumberSystem},
		{Name: "createdAt", Value: building.CreatedAt},
	}

	_, err = q.Run(ctx)
	if err != nil {
		http.Error(w, "Failed to update building", http.StatusInternalServerError)
		return
	}
}

func (h *BuildingsHandler) DeleteBuilding(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	buildingID := vars["id"]

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
