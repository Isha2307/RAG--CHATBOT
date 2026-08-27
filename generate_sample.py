from fpdf import FPDF
import os

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=15, style='B')
pdf.cell(200, 10, txt="Database Management Systems (DBMS)", ln=True, align='C')
pdf.set_font("Arial", size=12)
pdf.ln(10)

content = """
A Database Management System (DBMS) is software designed to store, retrieve, define, and manage data in a database. It provides an interface for users and applications to interact with stored data, ensuring that the data is consistently organized and remains easily accessible.

Key Functions of a DBMS:
1. Data Storage, Retrieval, and Update: The fundamental capability to read, write, and modify information efficiently.
2. Concurrency Control: Ensures that multiple transactions can execute simultaneously without interfering with each other. This prevents data inconsistency and maintains a property called serializability.
3. Transaction Management: Database operations are grouped into transactions that follow ACID properties (Atomicity, Consistency, Isolation, and Durability). This guarantees reliable processing even during power failures or system crashes.
4. Security and Access Control: Prevents unauthorized users from accessing sensitive data.
5. Backup and Recovery: Mechanisms that allow the database to be restored to a consistent state after failures, often utilizing logging and checkpointing techniques.

Types of Databases:
- Relational Databases (RDBMS): Store data in tables with rows and columns. SQL (Structured Query Language) is the standard language used for interaction. Examples include MySQL, PostgreSQL, and Oracle.
- NoSQL Databases: Designed for unstructured or semi-structured data, offering high scalability. Types include Document (MongoDB), Key-Value (Redis), Column-family (Cassandra), and Graph (Neo4j).

Database Design and Optimization:
- Normalization: The process of organizing data into related tables to reduce redundancy and improve data integrity.
- Indexing: A technique used to improve query performance by providing fast access paths to data, similar to an index in a book.
- Locking Protocols: Used in concurrency control. For instance, Two-Phase Locking (2PL) includes a growing phase where locks are acquired and a shrinking phase where locks are released to ensure data consistency during concurrent access.
"""

# Output multi-cell text
pdf.multi_cell(0, 8, txt=content)

os.makedirs('data', exist_ok=True)
pdf.output("data/sample.pdf")
print("Sample PDF generated at data/sample.pdf")
