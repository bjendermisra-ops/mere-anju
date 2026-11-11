"""One-time importer for the ten ORIGINAL attached photos of Roshani (Motki).
Runs in GitHub Actions, converts without changing content or facial appearance,
then deletes itself from the branch after importing.
"""
from pathlib import Path
from PIL import Image, ImageOps
from io import BytesIO
from urllib.request import Request, urlopen

URLS = [
  "https://d2jqrm6oza8nb6.cloudfront.net/datasets/f3e49335-2ed3-4712-8fb8-e2cc5590ba41.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZmQ3NDFmNWUxNmNhNjY0YSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDUxMTQ1NH0.ojk20Ni6CMEo4vKMvtIY7URa2KV-dgWiiGAxM2qoZew",
  "https://d2jqrm6oza8nb6.cloudfront.net/datasets/6673734b-94a5-4c8c-98d3-447f10805b35.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiM2YzOThjZTEwMDZkMThlYiIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDUzMTQyNX0.TTCH62XBHWY5WUCgpM7uCjvu730WiWBAisr9kQkO_PA",
  "https://d2jqrm6oza8nb6.cloudfront.net/datasets/f253d67a-7678-4ebd-afbb-9cf45e712efb.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMDc1MjI2NzhiMjU4Yjg0NiIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDQ5MTUxMn0.CWyYXK6eDANKVCCbBAmtnbwwwwTBTvGQutN9vsnAes4",
  "https://d2jqrm6oza8nb6.cloudfront.net/datasets/cba49b3d-3b0a-4a22-9801-0960914fd398.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNGRkNWFlYzk4NTUyODE2YSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDUyNzk0NX0.RV00s_eGcBgr1gXJ3EOr5XRofMKYAs-eXh_isWeIHk4",
  "https://d2jqrm6oza8nb6.cloudfront.net/datasets/6e701f1b-a4ad-4d26-b117-194e5b1a8660.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZTg1YmZiNDA5NmVkMzc4MiIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDUwMjIwOH0.7WQRjoNMhbPnu9Z_RKxk6utrCdyCsGNftuWrrSAz9qY",
  "https://d2jqrm6oza8nb6.cloudfront.net/datasets/f76f08e5-ccde-4859-9da9-9a5df76821cc.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZmExNGU5NGU1NTk5YjA0YSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDUzMjA0Nn0.Wrx5aqQVTpRUCx907SqSN49OLwInWvDyr9nPUZwH1zU",
  "https://d2jqrm6oza8nb6.cloudfront.net/datasets/de5423d0-02fb-4e68-8e41-cbaf1ba30327.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNDVhYjViYmVkZTU5YWZmYSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDQ4MDQ0Nn0.QyPwSUHvgnaKulWTDFPikCpPhjTRoNmccXa3x4WYfRY",
  "https://d2jqrm6oza8nb6.cloudfront.net/datasets/e393881a-1296-41b6-a252-f5a54b72f914.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMmRlNzQ5MDI0NmVmZTY1MyIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDQ5MDYyNn0.jDwgyJRajbYEOdmIbdpbQlwYqUXButI2AvcmIsxJzfY",
  "https://d2jqrm6oza8nb6.cloudfront.net/datasets/b0646b19-0976-4b3b-957e-2eda1e2b1360.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZmNhMGQwYTQ0NjkzMTA0NyIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDQ4NzIwNH0.Kc_vdsrMOdr41y0iisgRpEEmykeCB3yy77luLBCj6hE",
  "https://d2jqrm6oza8nb6.cloudfront.net/datasets/30c05626-4d87-4c2f-acb2-6447621bfbf6.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjdmM2QyYzViYjEzYzc0MiIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5NDQ5MjM1N30.FTRkXzSLnAyPGc2menTbh9IDfrtRkcb9iT8aukDwFew"
]

output_dir=Path("assets/photos")
output_dir.mkdir(parents=True,exist_ok=True)
for index,url in enumerate(URLS,1):
    dest=output_dir/f"sister-{index:02d}.webp"
    with urlopen(Request(url,headers={"User-Agent":"Mozilla/5.0"}),timeout=45) as response:
        data=response.read()
    if len(data)<5000:
        raise ValueError(f"Suspiciously small source photo {index}: {len(data)} bytes")
    source=Image.open(BytesIO(data))
    source=ImageOps.exif_transpose(source)
    source.load()
    if source.width < 300 or source.height < 300:
        raise ValueError(f"Photo {index} too small: {source.size}")
    source.thumbnail((1200,1800),Image.Resampling.LANCZOS)
    if source.mode not in ("RGB","RGBA"):
        source=source.convert("RGB")
    source.save(dest,format="WEBP",quality=86,method=6)
    print(f"Saved {dest}: {source.size}, {dest.stat().st_size} bytes")
print("All ten original Roshani portraits imported successfully.")
