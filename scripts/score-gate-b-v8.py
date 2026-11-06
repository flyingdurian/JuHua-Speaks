#!/usr/bin/env python3
"""Semantic-frame visual gate for the original owner-supplied 2026-11-06
ChatARot split-screen reference. The 14.13-second original is NOT in Git.
The owner now requires ±13% for Sequence 1 only; approved Sequence 2 is frozen. Thresholds are image-composition PROXIES, not a perceptual fidelity percentage.
Never claim visual approval solely from this script. Sequence 2 is approved and not re-scored here.
"""
import json,sys,math
from pathlib import Path
from PIL import Image

SOURCE_NOTE="Owner ChatARot / Gate B v6 comparison, ChatARot left half at 860x720"
# Measured from actual provided video using dark-blue card-back mask,
# 5-95th-percentile pixel envelope; no reference media redistributed.
REFERENCE=[
 ("tunnel_early",3.2,2.1,.0218,.8581,.7875,.6012,.5125),
 ("tunnel_open",3.5,3.0,.0212,.6081,.8167,.5698,.4514),
 ("tunnel_deep",3.85,3.8,.0446,.3779,.7639,.5430,.4667),
 ("tunnel_exit",4.1,4.7,.0484,.2942,.6556,.4547,.4486)
]
FIELDS=["fraction","width","height","cx","cy"]
# Direction of the blue-card vortex (major PCA axis) measured from the
# original user-supplied ChatARot movie at the exact reference timestamps.
# Degrees are axial/modulo 180, with an independent ±13-degree motion-form gate.
AXIS_REFERENCE={"tunnel_early":35.4,"tunnel_open":61.1,"tunnel_deep":69.8,"tunnel_exit":79.8}
AXIS_TOLERANCE_DEG=13.0
TOLERANCE=.13

def quantile(counts,n,quant):
 threshold=n*quant
 running=0
 for i,a in enumerate(counts):
  running+=a
  if running>=threshold:return i
 return len(counts)-1

def measure(path):
 im=Image.open(path).convert("RGB")
 w,h=im.size
 hist_x=[0]*w;hist_y=[0]*h;count=0
 sumx=sumy=sumxx=sumyy=sumxy=0
 p=im.load()
 for y in range(40,min(680,h)):
  for x in range(w):
   r,g,b=p[x,y]
   if b>20 and b>g*1.10 and b>r*1.18 and b-g>3:
    count+=1;hist_x[x]+=1;hist_y[y]+=1
    sumx+=x;sumy+=y;sumxx+=x*x;sumyy+=y*y;sumxy+=x*y
 if count<300:return {"count":count,"missing":True}
 x5,x50,x95=[quantile(hist_x,count,q) for q in [.05,.50,.95]]
 y5,y50,y95=[quantile(hist_y,count,q) for q in [.05,.50,.95]]
 covxx=sumxx/count-(sumx/count)**2
 covyy=sumyy/count-(sumy/count)**2
 covxy=sumxy/count-(sumx/count)*(sumy/count)
 axis_deg=(math.degrees(.5*math.atan2(2*covxy,covxx-covyy))%180)
 return {"fraction":count/(860*640),"width":(x95-x5)/860,
  "height":(y95-y5)/720,"cx":x50/860,"cy":y50/720,"pixels":count,"axis_deg":round(axis_deg,2)}

def main():
 target=Path(sys.argv[1] if len(sys.argv)>1 else "artifacts/gate-b-v7")
 beats=[]
 for name,reference_time,candidate_time,*vals in REFERENCE:
  ref=dict(zip(FIELDS,vals))
  path=target/("frame-%.1f.png"%candidate_time)
  candidate=measure(path)
  errors={k:round(abs(candidate[k]-ref[k])/max(ref[k],.001),3)
          for k in FIELDS if k in candidate}
  raw_axis_error=abs(candidate.get('axis_deg',999)-AXIS_REFERENCE[name])
  axis_error=min(raw_axis_error,abs(180-raw_axis_error))
  beats.append({"beat":name,"reference_time":reference_time,
   "candidate_time":candidate_time,"reference":ref,
   "candidate":candidate,"relative_errors":errors,
   "reference_axis_deg":AXIS_REFERENCE[name],"axis_error_deg":round(axis_error,2),
   "within_proxy_tolerance":len(errors)==5 and max(errors.values())<=TOLERANCE and axis_error<=AXIS_TOLERANCE_DEG})
 failing=[b["beat"] for b in beats if not b["within_proxy_tolerance"]]
 result={"source_note":SOURCE_NOTE,"tolerance":TOLERANCE,
  "axis_tolerance_degrees":AXIS_TOLERANCE_DEG,
  "status":"PASS_PROXIES_ONLY" if not failing else "REJECT_PROXIES",
  "failing_beats":failing,"beats":beats,
  "warning":"Even passing all five image-envelope proxies does NOT prove perceptual fidelity or owner approval. Sequence 2 remains frozen."}
 target.mkdir(parents=True,exist_ok=True)
 (target/"visual-fidelity-report.json").write_text(json.dumps(result,indent=2)+"\n")
 print("VISUAL-FIDELITY:",result["status"],"failed=",",".join(failing) or "none")
 if failing:sys.exit(1)

if __name__=="__main__":
 main()
