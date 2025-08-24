from flask import Flask, request, jsonify, render_template
import sqlite3

# Tell Flask where to find templates + static
app = Flask(__name__, static_folder="templates/static")

# --- Database Setup ---
def init_db():
    conn = sqlite3.connect("students.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS students
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  roll INTEGER UNIQUE NOT NULL,
                  marks INTEGER NOT NULL)''')
    conn.commit()
    conn.close()

init_db()

# --- Routes ---
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/students", methods=["GET"])
def get_students():
    conn = sqlite3.connect("students.db")
    c = conn.cursor()
    c.execute("SELECT * FROM students")
    rows = c.fetchall()
    conn.close()
    students = [{"id": r[0], "name": r[1], "roll": r[2], "marks": r[3]} for r in rows]
    return jsonify(students)

@app.route("/students", methods=["POST"])
def add_student():
    data = request.get_json()
    conn = sqlite3.connect("students.db")
    c = conn.cursor()
    c.execute("INSERT INTO students (name, roll, marks) VALUES (?, ?, ?)",
              (data["name"], data["roll"], data["marks"]))
    conn.commit()
    conn.close()
    return jsonify({"message": "Student added successfully"})

@app.route("/students/<int:roll>", methods=["PUT"])
def update_student(roll):
    data = request.get_json()
    conn = sqlite3.connect("students.db")
    c = conn.cursor()
    c.execute("UPDATE students SET marks=? WHERE roll=?", (data["marks"], roll))
    conn.commit()
    conn.close()
    return jsonify({"message": "Student updated successfully"})

@app.route("/students/<int:roll>", methods=["DELETE"])
def delete_student(roll):
    conn = sqlite3.connect("students.db")
    c = conn.cursor()
    c.execute("DELETE FROM students WHERE roll=?", (roll,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Student deleted successfully"})

# --- Run App ---
if __name__ == "__main__":
    port = 5000  # you can change this if you want
    url = f"http://127.0.0.1:{port}"
    print(f"\n🚀 Your app is running! Open this URL in your browser:\n👉 {url}\n")
    app.run(debug=True, port=port)
