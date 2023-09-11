// mail.go
package mail

import (
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
)

type MailgunClient struct {
	domain        string
	from          string
	privateAPIKey string
	frontendUrl   string
	httpClient    *http.Client
}

func NewMailgunClient(domain, from, apiKey, frontendUrl string) *MailgunClient {
	return &MailgunClient{
		domain:        domain,
		from:          from,
		privateAPIKey: apiKey,
		frontendUrl:   frontendUrl,
		httpClient:    &http.Client{},
	}
}

func (m *MailgunClient) Send(to string, subject string, text string, html string) error {
	endpoint := fmt.Sprintf("https://api.mailgun.net/v3/%s/messages", m.domain)

	data := url.Values{}
	data.Set("from", m.from)
	data.Set("to", to)
	data.Set("subject", subject)
	data.Set("text", text)
	data.Set("html", html)

	req, err := http.NewRequest(http.MethodPost, endpoint, strings.NewReader(data.Encode()))
	if err != nil {
		fmt.Println("MAIL ERR", err)
		return err
	}

	req.Header.Add("Authorization", "Basic "+basicAuth("api", m.privateAPIKey))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	resp, err := m.httpClient.Do(req)
	if err != nil {
		fmt.Println("MAIL ERR2 ", err)

		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		bodyString := string(bodyBytes)
		fmt.Println("MAIL ERR3 ", resp.StatusCode, bodyString)
		return fmt.Errorf("failed to send email with status: %s, body: %s", resp.Status, bodyString)
	}

	return nil
}

func (m *MailgunClient) SendInvite(userEmail, orgID, orgName string) error {
	subject := fmt.Sprintf("You have been invited to %s", orgName)
	inviteURL := fmt.Sprintf("%s/accept-invite/%s", m.frontendUrl, orgID)
	text := fmt.Sprintf("You have been invited to join %s. Accept the invitation here: %s", orgName, inviteURL)
	html := fmt.Sprintf(`
		<html>
		<body>
			<h2>You have been invited to join %s</h2>
			<p><a href="%s">Click here to accept the invitation</a></p>
		</body>
		</html>
	`, orgName, inviteURL)

	return m.Send(userEmail, subject, text, html)
}

func basicAuth(username, password string) string {
	auth := username + ":" + password
	return base64.StdEncoding.EncodeToString([]byte(auth))
}
