package user

type User struct {
	ID              string   `json:"id"`
	DisplayName     string   `json:"displayName"`
	Email           string   `json:"email"`
	PhotoURL        string   `json:"photoUrl"`
	OrganizationIds []string `json:"organizationIds"`
}
