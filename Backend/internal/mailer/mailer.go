// Package mailer: pengirim email sederhana.
// Kalau SMTP_HOST kosong, email TIDAK dikirim; isinya (termasuk kode verifikasi)
// dicetak di terminal backend supaya alur bisa dites tanpa setup email.
package mailer

import (
	"log"
	"net/smtp"
	"os"
	"strings"
)

type Sender interface {
	Send(to, subject, body string) error
}

// ---------- SMTP (mis. Gmail dengan App Password) ----------

type SMTP struct {
	Host, Port, User, Pass, From string
}

func (s SMTP) Send(to, subject, body string) error {
	msg := strings.Join([]string{
		"From: PyVenture <" + s.From + ">",
		"To: " + to,
		"Subject: " + subject,
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
		"",
		body,
	}, "\r\n")
	auth := smtp.PlainAuth("", s.User, s.Pass, s.Host)
	return smtp.SendMail(s.Host+":"+s.Port, auth, s.From, []string{to}, []byte(msg))
}

// ---------- Mode dev: cetak ke terminal ----------

type Console struct{}

func (Console) Send(to, subject, body string) error {
	log.Printf("[EMAIL-DEV] ke=%s subjek=%q\n%s", to, subject, body)
	return nil
}

// FromEnv membaca SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASS, SMTP_FROM.
func FromEnv() Sender {
	host := os.Getenv("SMTP_HOST")
	if host == "" {
		log.Println("SMTP_HOST kosong: email tidak dikirim, kode verifikasi dicetak di terminal ini (mode dev)")
		return Console{}
	}
	port := os.Getenv("SMTP_PORT")
	if port == "" {
		port = "587"
	}
	user := os.Getenv("SMTP_USER")
	from := os.Getenv("SMTP_FROM")
	if from == "" {
		from = user
	}
	return SMTP{Host: host, Port: port, User: user, Pass: os.Getenv("SMTP_PASS"), From: from}
}
