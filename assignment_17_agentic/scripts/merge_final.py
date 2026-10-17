#!/usr/bin/env python3
"""Merge cover + body into the final report PDF (normalize pages to A4)."""
from pypdf import PdfReader, PdfWriter

A4_W, A4_H = 595.28, 841.89

def normalize(page):
    box = page.mediabox
    w, h = float(box.width), float(box.height)
    if abs(w - A4_W) > 0.1 or abs(h - A4_H) > 0.1:
        page.scale_to(A4_W, A4_H)
    return page

writer = PdfWriter()
writer.add_page(normalize(PdfReader('/home/z/my-project/scripts/cover.pdf').pages[0]))
for p in PdfReader('/home/z/my-project/scripts/body.pdf').pages:
    writer.add_page(normalize(p))
writer.add_metadata({
    '/Title': 'Assignment 17: Agentic Application Development - Experience Report',
    '/Author': 'Z.ai',
    '/Creator': 'Z.ai',
    '/Subject': 'Experience report on agentic application development - Team Dionysus',
})
out = '/home/z/my-project/download/Assignment-17-Agentic-App-Development-Team-Dionysus.pdf'
with open(out, 'wb') as f:
    writer.write(f)
print('OK ->', out, '| pages:', len(writer.pages))
